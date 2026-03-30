import random
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

data = []

for i in range(1000):

    distance = random.uniform(1, 30)
    cost = random.uniform(20, 120)
    power = random.uniform(10, 150)
    battery = random.uniform(10, 90)

    remaining_range = random.uniform(0, 50)

    # RULE-BASED LABEL (SMART)
    score = 0

    # prefer reachable chargers
    if remaining_range > 5:
        score += 2

    # prefer closer if battery low
    if battery < 40:
        score -= distance * 0.2
    else:
        score -= distance * 0.05

    # prefer fast chargers
    score += power * 0.05

    # prefer cheaper
    score -= cost * 0.02

    best = 1 if score > 0 else 0

    data.append([
        distance,
        cost,
        power,
        battery,
        remaining_range,
        best
    ])

df = pd.DataFrame(data, columns=[
    "distance",
    "cost",
    "power",
    "battery",
    "remaining_range",
    "best"
])

X = df.drop("best", axis=1)
y = df["best"]

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "ml_model.pkl")

print("🔥 New model trained!")