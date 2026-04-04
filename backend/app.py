import serial
import threading
import sqlite3
from flask import Flask, jsonify, request

app = Flask(__name__)

# 🔌 Serial Port (change if needed)
ser = serial.Serial('COM7', 9600)

# ─────────────────────────────────────────
# 🧠 DATABASE INIT
# ─────────────────────────────────────────
def init_db():
    conn = sqlite3.connect("site.db")
    c = conn.cursor()

    # sensor → batch mapping
    c.execute("""
    CREATE TABLE IF NOT EXISTS sensor_batch (
        sensor TEXT PRIMARY KEY,
        batch TEXT,
        max_temp REAL
    )
    """)

    # batch data
    c.execute("""
    CREATE TABLE IF NOT EXISTS batch_data (
        batch TEXT PRIMARY KEY,
        temperature REAL,
        humidity REAL,
        risk INTEGER
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ─────────────────────────────────────────
# 🔥 SERIAL READER THREAD
# ─────────────────────────────────────────
def read_serial():
    while True:
        try:
            line = ser.readline().decode('utf-8').strip()

            # Expected: sensor1,28,65
            if line:
                sensor, temp, humidity = line.split(",")

                conn = sqlite3.connect("site.db")
                c = conn.cursor()

                # 🔎 Find batch mapping
                c.execute(
                    "SELECT batch, max_temp FROM sensor_batch WHERE sensor=?",
                    (sensor,)
                )
                row = c.fetchone()

                if row:
                    batch, max_temp = row

                    if batch and max_temp is not None:
                        temp_val = float(temp)

                        c.execute("SELECT risk FROM batch_data WHERE batch=?", (batch,))
                        prev_row = c.fetchone()

                        prev_risk = prev_row[0] if prev_row else 0

                        # temperature difference from safe limit
                        diff = temp_val - max_temp

                        # base increment
                        increment = 0

                        if diff > 0:
                         # above safe temperature → higher increase
                            increment = min(diff * 5, 20)
                        elif temp_val > max_temp * 0.9:
                         # near threshold → small increase
                            increment = 1
                        else:
                         # safe → no increase
                            increment = 0

                    # 🔥 FINAL RISK (only increases)
                        risk = prev_risk + increment

                    # clamp max
                        risk = min(risk, 100)

                        # 💾 Store batch data
                        c.execute("""
                        INSERT INTO batch_data (batch, temperature, humidity, risk)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(batch) DO UPDATE SET
                            temperature=excluded.temperature,
                            humidity=excluded.humidity,
                            risk=excluded.risk
                        """, (batch, temp, humidity, risk))

                        conn.commit()

                        print(f"Updated → {sensor} → {batch} | Temp={temp} Risk={risk}")
                else:
                    print(f"No mapping found for {sensor}")

                conn.close()

        except Exception as e:
            print("Error:", e)

# 🧵 Start thread
thread = threading.Thread(target=read_serial)
thread.daemon = True
thread.start()

# ─────────────────────────────────────────
# 1️⃣ ASSIGN SENSOR → BATCH
# ─────────────────────────────────────────
@app.route('/assign', methods=['POST'])
def assign():
    data = request.json

    sensor = data.get("sensor")
    batch = data.get("batch")
    max_temp = data.get("max_temp")

    conn = sqlite3.connect("site.db")
    c = conn.cursor()

    c.execute("""
    INSERT INTO sensor_batch (sensor, batch, max_temp)
    VALUES (?, ?, ?)
    ON CONFLICT(sensor) DO UPDATE SET
        batch=excluded.batch,
        max_temp=excluded.max_temp
    """, (sensor, batch, max_temp))

    conn.commit()
    conn.close()

    print(f"Assigned → {sensor} → {batch}, max_temp={max_temp}")

    return jsonify({"status": "assigned"})

# ─────────────────────────────────────────
# 2️⃣ GET DATA BY BATCH (FOR FRONTEND)
# ─────────────────────────────────────────
@app.route('/batch/<batch_id>', methods=['GET'])
def get_batch(batch_id):
    conn = sqlite3.connect("site.db")
    c = conn.cursor()

    c.execute(
        "SELECT temperature, humidity, risk FROM batch_data WHERE batch=?",
        (batch_id,)
    )
    row = c.fetchone()

    conn.close()

    if row:
        return jsonify({
            "temperature": row[0],
            "humidity": row[1],
            "risk": row[2]
        })

    return jsonify({
        "temperature": None,
        "humidity": None,
        "risk": None
    })

# ─────────────────────────────────────────
# 3️⃣ DEBUG: VIEW ALL DATA (OPTIONAL)
# ─────────────────────────────────────────
@app.route('/debug', methods=['GET'])
def debug():
    conn = sqlite3.connect("site.db")
    c = conn.cursor()

    c.execute("SELECT * FROM batch_data")
    data = c.fetchall()

    conn.close()

    return jsonify({"data": data})

# ─────────────────────────────────────────
# 🚀 RUN SERVER
# ─────────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)