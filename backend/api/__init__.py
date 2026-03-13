from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
import numpy as np
import threading
import time

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    socketio = SocketIO(app, cors_allowed_origins="*")

    # ----------------------------
    # Simulation / Model Parameters
    # ----------------------------
    class Sim:
        def __init__(self):
            self.n = 20
            self.dt = 0.01
            self.K = 1.5 
            self.omega = np.linspace(1.0, 2.0, self.n)  
            self.A = np.zeros((self.n, self.n))         
            self.theta = np.random.uniform(0, 2*np.pi, self.n)

            self.running = False
            self.thread = None
            self.lock = threading.Lock()

        # ---- Kuramoto ODE: dθ_i/dt = ω_i + (K / deg_i) Σ_j A_ij sin(θ_j - θ_i) ----

        def ode_step(self):
            with self.lock:
                theta = self.theta
                A = self.A
                K = self.K
                omega = self.omega
                n = self.n

                deg = A.sum(axis=1) + 1e-9  # avoid div by 0
                # compute coupling sum
                # for efficiency: use broadcasting
                # sin(θ_j - θ_i) for all i,j
                theta_i = theta.reshape((n, 1))
                theta_j = theta.reshape((1, n))
                phase_diff = theta_j - theta_i
                coupling = (A * np.sin(phase_diff)).sum(axis=1) / deg

                dtheta = omega + K * coupling
                self.theta = theta + self.dt * dtheta

        def run(self):
            self.running = True
            while self.running:
                self.ode_step()

                # Emit live payload:
                # - phase: θ_i
                # - flash: in [0,1] for "brightness/pulse" (use (sin θ + 1)/2)
                # - value: normalized metric for color mapping (here cos θ mapped to [0,1])

                with self.lock:
                    theta = self.theta.copy()
                flash = 0.5 * (np.sin(theta) + 1.0)
                value_raw = np.cos(theta)

                vmin, vmax = value_raw.min(), value_raw.max()
                if vmax - vmin < 1e-9:
                    value = np.zeros_like(value_raw)
                else:
                    value = (value_raw - vmin) / (vmax - vmin)

                socketio.emit(
                    "node_update",
                    {
                        "phase": theta.tolist(),
                        "flash": flash.tolist(),
                        "value": value.tolist(),
                    },
                )
                socketio.sleep(0.03)  # ~33 FPS

        def start(self):
            if self.running:
                return
            self.thread = threading.Thread(target=self.run, daemon=True)
            self.thread.start()

        def stop(self):
            self.running = False
            if self.thread and self.thread.is_alive():
                self.thread.join(timeout=0.5)
            self.thread = None

        def set_graph(self, n, edges, directed=False):
            with self.lock:
                self.n = n
                self.theta = np.random.uniform(0, 2*np.pi, n)
                self.A = np.zeros((n, n))
                for u, v in edges:
                    self.A[u][v] = 1.0
                    if not directed:
                        self.A[v][u] = 1.0

        def set_params(self, omega=None, K=None, dt=None):
            with self.lock:
                if omega is not None:
                    self.omega = np.array(omega, dtype=float)
                    if len(self.omega) != self.n:
                        raise ValueError("omega length must equal n")
                if K is not None:
                    self.K = float(K)
                if dt is not None:
                    self.dt = float(dt)

    sim = Sim()

    # ----------------------------
    #           API
    # ----------------------------
    HARDCODED_EDGES = [
    [3, 1], [3, 2], [1, 2], [2, 3],
    [3, 4], [4, 5], [5, 6], [5, 16],
    [5, 1], [6, 7], [7, 8], [8, 7],
    [9, 10], [10, 6], [11, 12], [12, 1],
    [13, 12], [14, 3], [15, 8], [16, 17],
    [17, 14], [15, 18], [11, 9], [18, 16],
    [13, 7], [7, 19], [19, 3], [20,13], [11,20]
]
    

    @app.route("/graph", methods=["GET"])
    def get_graph():
        with sim.lock:
            n = sim.n
            A = sim.A.copy()
        nodes = [{"id": i + 1} for i in range(n)]
        edges = HARDCODED_EDGES
        src, dst = np.where(A > 0)
        for u, v in zip(src.tolist(), dst.tolist()):
            edges.append([u, v])
        return jsonify({"n": n, "nodes": nodes, "edges": edges})

    @app.route("/graph", methods=["POST"])
    def set_graph():
        payload = request.get_json(force=True)
        n = int(payload.get("n"))
        edges = payload.get("edges", [])  # [[u,v], ...] with 0-based ids
        directed = bool(payload.get("directed", False))
        sim.set_graph(n, HARDCODED_EDGES, directed=directed)
        return jsonify({"message": "graph updated", "n": n, "edges": edges})

    @app.route("/params", methods=["POST"])
    def set_params():
        payload = request.get_json(force=True)
        omega = payload.get("omega")  # list length n
        K = payload.get("K")
        dt = payload.get("dt")
        try:
            sim.set_params(omega=omega, K=K, dt=dt)
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        return jsonify({"message": "params updated"})

    @app.route("/start_simulation", methods=["POST"])
    def start_simulation():
        sim.start()
        return jsonify({"message": "simulation started"})

    @app.route("/stop_simulation", methods=["POST"])
    def stop_simulation():
        sim.stop()
        return jsonify({"message": "simulation stopped"})

    return app, socketio

