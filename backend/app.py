from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import logging
import os
import engine
import atexit
from uuid import uuid4
from werkzeug.utils import secure_filename

from config import ALLOWED_MODELS, DEFAULT_MODEL, TEMP_FOLDER
from storage import cleanup_temp_storage, ensure_storage_dirs, purge_old_temp_files

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for the streaming response (Mimetype: application/x-ndjson could be used, but text/plain is simpler for fetch streams)
CORS(app, resources={r"/*": {"origins": "*"}}, expose_headers=["Content-Type"])

ensure_storage_dirs()
atexit.register(cleanup_temp_storage)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    model_name = request.form.get('model', DEFAULT_MODEL)
    if model_name not in ALLOWED_MODELS:
        logger.warning("Rejected analyze request with invalid model: %s", model_name)
        return jsonify({"error": "Invalid model"}), 400

    purge_old_temp_files()
    unique_name = f"{uuid4().hex}_{filename}"
    filepath = os.path.join(TEMP_FOLDER, unique_name)
    file.save(filepath)
    
    logger.info("Queued analyze request for file %s with model %s", unique_name, model_name)

    def generate():
        # Yield from engine
        yield from engine.analyze_audio(filepath, model_name=model_name)
        # Note: We NO LONGER cleanup here because user wants to hold it.

    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')

@app.route('/re-analyze', methods=['POST'])
def re_analyze():
    data = request.get_json(silent=True) or {}
    raw_filename = data.get('filename')
    model_name = data.get('model', DEFAULT_MODEL)
    
    if not raw_filename:
        return jsonify({"error": "No filename provided"}), 400

    if model_name not in ALLOWED_MODELS:
        logger.warning("Rejected re-analyze request with invalid model: %s", model_name)
        return jsonify({"error": "Invalid model"}), 400

    filename = secure_filename(os.path.basename(raw_filename))
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    filepath = os.path.join(TEMP_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found on server"}), 404
        
    def generate():
        yield from engine.analyze_audio(filepath, model_name=model_name)
        
    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')

@app.route('/audio/<filename>')
def serve_audio(filename):
    from flask import send_from_directory

    safe_name = secure_filename(filename)
    if not safe_name:
        return jsonify({"error": "Invalid filename"}), 400

    logger.info("Serving audio file: %s", safe_name)
    return send_from_directory(TEMP_FOLDER, safe_name)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
