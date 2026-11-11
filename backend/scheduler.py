"""
YamunaPulse Autonomous Ingestion Scheduler
Runs periodic background synchronization with Microsoft Planetary Computer STAC.
Automatically detects when new Sentinel-2 L2A passes become available over Delhi (every 5 days)
and ingests them into DuckDB.
"""

import time
import logging
import threading
from datetime import datetime
from typing import Optional

from backend.ingest_stac import sync_new_satellite_passes, DB_PATH

logger = logging.getLogger("yamunapulse.scheduler")
logging.basicConfig(level=logging.INFO)

class SatelliteIngestionScheduler:
    def __init__(self, interval_hours: float = 6.0, db_path: str = DB_PATH):
        self.interval_seconds = int(interval_hours * 3600)
        self.db_path = db_path
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self.last_sync_time: Optional[datetime] = None
        self.last_sync_result: Optional[dict] = None

    def start(self):
        """Starts the background scheduler thread."""
        if self._thread is not None and self._thread.is_alive():
            logger.info("Scheduler already running.")
            return

        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        logger.info("Started background satellite ingestion scheduler (interval: %d seconds).", self.interval_seconds)

    def stop(self):
        """Stops the background scheduler thread."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)
            logger.info("Background satellite ingestion scheduler stopped.")

    def trigger_sync(self) -> dict:
        """Manual or programmatic immediate sync execution."""
        logger.info("Triggering satellite pass synchronization with Planetary Computer STAC...")
        result = sync_new_satellite_passes(db_path=self.db_path)
        self.last_sync_time = datetime.now()
        self.last_sync_result = result
        return result

    def _run_loop(self):
        # Initial check on startup after a brief delay
        time.sleep(10)
        while not self._stop_event.is_set():
            try:
                self.trigger_sync()
            except Exception as e:
                logger.error("Error in scheduled satellite ingestion: %s", e)

            # Wait for next interval or stop signal
            self._stop_event.wait(self.interval_seconds)

# Global singleton scheduler instance
scheduler = SatelliteIngestionScheduler(interval_hours=6.0)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="YamunaPulse Satellite Ingestion Scheduler")
    parser.add_argument("--sync-once", action="store_true", help="Run a single synchronization and exit")
    parser.add_argument("--interval", type=float, default=6.0, help="Interval in hours for daemon mode")
    args = parser.parse_args()

    if args.sync_once:
        res = sync_new_satellite_passes()
        print("Sync result:", res)
    else:
        sched = SatelliteIngestionScheduler(interval_hours=args.interval)
        sched.start()
        print(f"Scheduler daemon running (checks STAC every {args.interval} hours). Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            sched.stop()

