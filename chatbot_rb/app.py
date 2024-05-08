from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from chat import get_response

app = Flask(__name__)
"""CORS(app)"""

@app.route("/")
def index_get():
    return render_template("index.html")

    
@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "POST":
        text = request.get_json().get("message")
        response = get_response(text)
        message = {"answer": response}
        print("response", message)
        return jsonify(message)
    
    else:
        # Handle GET requests if needed
        return jsonify({"message": "This endpoint only accepts POST requests."})

if __name__ == "__main__":
    app.run(debug=True)