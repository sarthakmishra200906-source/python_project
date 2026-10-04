"""Seed a repeatable synthetic customer population for the employee demo."""
import os
import random
import uuid

import bcrypt
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def connect():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "root"),
        database=os.getenv("MYSQL_DB", "recharge_db"),
    )


def main():
    connection = connect()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer' AFTER payment_pin_hash")
        connection.commit()
    except mysql.connector.Error as error:
        if error.errno != 1060:
            raise

    cursor.execute("SELECT id, name, price, network_type FROM plans WHERE category IN ('Popular', 'Network', 'Unlimited', 'Data')")
    plans = cursor.fetchall()
    cursor.execute("SELECT COUNT(*) AS count FROM users WHERE email LIKE 'demo.customer.%@rechargex.local'")
    seeded_count = cursor.fetchone()["count"]

    demo_hash = bcrypt.hashpw(b"demo1234", bcrypt.gensalt()).decode()
    admin_hash = bcrypt.hashpw(b"admin1234", bcrypt.gensalt()).decode()
    cursor.execute("SELECT id FROM users WHERE phone = '9000000000'")
    if not cursor.fetchone():
        cursor.execute(
            """INSERT INTO users (name, phone, email, password_hash, plan_name, network_type, role)
               VALUES (%s, %s, %s, %s, %s, %s, 'admin')""",
            ("Demo Employee", "9000000000", "employee@rechargex.local", admin_hash, "Employee Console", "4G"),
        )
        connection.commit()

    if seeded_count >= 1000:
        print("Synthetic customer seed already complete.")
        return

    customer_rows = []
    for index in range(1000):
        plan = random.choice(plans)
        customer_rows.append(
            (
                f"Demo Customer {index + 1}",
                str(8000000000 + index),
                f"demo.customer.{index + 1}@rechargex.local",
                demo_hash,
                plan["name"],
                plan["network_type"] or "4G",
            )
        )

    cursor.executemany(
        """INSERT IGNORE INTO users
           (name, phone, email, password_hash, plan_name, network_type, role)
           VALUES (%s, %s, %s, %s, %s, %s, 'customer')""",
        customer_rows,
    )
    connection.commit()

    cursor.execute("SELECT id FROM users WHERE email LIKE 'demo.customer.%@rechargex.local'")
    customer_ids = [row["id"] for row in cursor.fetchall()]
    transaction_rows = []
    for user_id in customer_ids:
        for _ in range(random.randint(1, 3)):
            plan = random.choice(plans)
            transaction_rows.append(
                (user_id, plan["id"], float(plan["price"]), f"DEMO{uuid.uuid4().hex[:16].upper()}", "Success")
            )

    cursor.executemany(
        """INSERT INTO transactions (user_id, plan_id, amount, transaction_id, status)
           VALUES (%s, %s, %s, %s, %s)""",
        transaction_rows,
    )
    connection.commit()
    print(f"Seeded {len(customer_rows)} synthetic customers and {len(transaction_rows)} recharge records.")


if __name__ == "__main__":
    main()
