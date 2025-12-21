from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import os
import engine
import atexit
import shutil

app = Flask(__name__)
# Enable CORS for the streaming response (Mimetype: application/x-ndjson could be used, but text/plain is simpler for fetch streams)
CORS(app, resources={r"/*": {"origins": "*"}}, expose_headers=["Content-Type"])

UPLOAD_FOLDER = 'uploads'
TEMP_FOLDER = 'temp_audio'

for folder in [UPLOAD_FOLDER, TEMP_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

def cleanup():
    print("Cleaning up temporary audio files...")
    if os.path.exists(TEMP_FOLDER):
        shutil.rmtree(TEMP_FOLDER)

atexit.register(cleanup)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    model_name = request.form.get('model', 'htdemucs_6s')
    filepath = os.path.join(TEMP_FOLDER, file.filename)
    file.save(filepath)
    
    def generate():
        # Yield from engine
        yield from engine.analyze_audio(filepath, model_name=model_name)
        # Note: We NO LONGER cleanup here because user wants to hold it.

    return Response(stream_with_context(generate()), mimetype='application/json')

@app.route('/re-analyze', methods=['POST'])
def re_analyze():
    data = request.json
    filename = data.get('filename')
    model_name = data.get('model', 'htdemucs_6s')
    
    if not filename:
        return jsonify({"error": "No filename provided"}), 400
        
    filepath = os.path.join(TEMP_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found on server"}), 404
        
    def generate():
        yield from engine.analyze_audio(filepath, model_name=model_name)
        
    return Response(stream_with_context(generate()), mimetype='application/json')

@app.route('/audio/<filename>')
def serve_audio(filename):
    from flask import send_from_directory
    print(f"SERVING_AUDIO: {filename}")
    return send_from_directory(TEMP_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
