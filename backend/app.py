from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import os
import engine

app = Flask(__name__)
# Enable CORS for the streaming response (Mimetype: application/x-ndjson could be used, but text/plain is simpler for fetch streams)
CORS(app, expose_headers=["Content-Type"])

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    
    def generate():
        # Yield from engine
        yield from engine.analyze_audio(filepath)
        # Cleanup
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except: pass

    return Response(stream_with_context(generate()), mimetype='application/json')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
