from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from app.config import get_config

config = get_config()

class AnomalyDetector:
    def __init__(self):
        self.iso_forest = IsolationForest(
            contamination=config.ANOMALY_CONTAMINATION,
            random_state=42
        )
        self.dbscan = DBSCAN(
            eps=config.DBSCAN_EPS,
            min_samples=config.DBSCAN_MIN_SAMPLES
        )

    def detect(self, data):
        anomalies = self.iso_forest.fit_predict(data)
        clusters = self.dbscan.fit_predict(data)
        return anomalies, clusters