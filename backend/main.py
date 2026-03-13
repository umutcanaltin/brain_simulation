from api import create_app
import os


app = create_app()


if __name__ == "__main__":
    app, socketio = create_app()
    socketio.run(app, host="0.0.0.0", port=8000,allow_unsafe_werkzeug=True)