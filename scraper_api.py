from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/scrape', methods=['POST'])
def run_scraper():
    data = request.json
    event_url = data.get("event_url")
    if not event_url:
        return jsonify({"error": "Missing event_url"}), 400

    print(f"Scraping event: {event_url}")

    # Run the actual scraping script (adapt to your setup)
    subprocess.run(["python3", "luma_scraper.py", event_url])

    return jsonify({"status": "ok", "message": "Scraper started"}), 200

if __name__ == "__main__":
    app.run(port=5000)