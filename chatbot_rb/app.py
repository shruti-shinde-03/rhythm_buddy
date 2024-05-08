from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from chat import get_response
import requests

app = Flask(__name__)
"""CORS(app)"""

chat_history = []

def analyze_tone(chat_data):
    response = requests.post(
        "https://api.sapling.ai/api/v1/tone",
        json={
            "key": "KNTZA9DC81N8L0NG3ZXYKMY0BQ1A87H3",
            "text": chat_data
        }
    )
    if response.status_code == 200:
        data = response.json()
        results_list = data['results'][0]
        high_confidence_results = [item for item in results_list if item[0] > 0.95]
        high_confidence_emotions = [item[1] for item in high_confidence_results]

        print(high_confidence_emotions)
        emotion = "\n".join(high_confidence_emotions)
        print(emotion)
        base_url = "http://ws.audioscrobbler.com/2.0/"
        api_method = "tag.gettoptracks"
        api_key = "5b214285019dbff9fb6205304ac328d3"
        response_format = "json"
        url = f"{base_url}?method={api_method}&tag={emotion}&api_key={api_key}&format={response_format}"
        response = requests.get(url)
        payload = response.json()
        print(payload)
        # Checking if the request was successful
        if response.status_code == 200:
            # If successful, get the JSON response
            data = response.json()
            print("Data retrieved:", data)
        else:
            # If the request failed, print the status code
            print("Error:", response.status_code, response.text)

        return data
    else:
        return None

@app.route("/")
def index_get():
    return render_template("index.html")

    
@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "POST":
        text = request.get_json().get("message")
        chat_history.append(f"User: {text}")
        response = get_response(text)
        
        
        message = {"answer": response}
        print("response", message)
        return jsonify(message)
    
    else:
        # Handle GET requests if needed
        return jsonify({"message": "This endpoint only accepts POST requests."})


@app.route("/analyze_tone", methods=["POST"])  # New endpoint for analyzing tone
def analyze_tone_endpoint():
    chat_data = "\n".join(chat_history)  # Get the chat history as a single text
    tone_result = analyze_tone(chat_data)

    if not tone_result:
        return jsonify({"error": "Tone analysis failed"}), 500  # Internal server error

    return jsonify(tone_result), 200

if __name__ == "__main__":
    app.run(debug=True)