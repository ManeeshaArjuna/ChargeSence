import random
import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib

data = []

for i in range(500):
    distance = random.uniform(1, 20)
    cost = random.uniform(20, 100)
    power = random.uniform(10, 150)
    battery = random.uniform(10, 80)

    score = (distance * 0.5) + (cost * 0.2) - (power * 0.3)

    best = 1 if score < 20 else 0

    data.append([distance, cost, power, battery, best])

df = pd.DataFrame(data, columns=[
    "distance", "cost", "power", "battery", "best"
])

X = df[["distance", "cost", "power", "battery"]]
y = df["best"]

model = LogisticRegression()
model.fit(X, y)

joblib.dump(model, "ml_model.pkl")

print("Model trained & saved ✅")