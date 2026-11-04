import argparse
import csv
from datetime import date, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


ROOT = Path(__file__).resolve().parent.parent
AUTH_DIR = ROOT / ".google-seo"
CLIENT_SECRETS = AUTH_DIR / "client_secret.json"
TOKEN_FILE = AUTH_DIR / "search_console_token.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
DIMENSION_CHOICES = ("date", "query", "page", "country", "device", "searchAppearance")


def get_credentials():
    AUTH_DIR.mkdir(exist_ok=True)
    credentials = None
    if TOKEN_FILE.exists():
        credentials = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if credentials and credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
    elif not credentials or not credentials.valid:
        if not CLIENT_SECRETS.exists():
            raise FileNotFoundError(
                f"OAuth client file not found: {CLIENT_SECRETS}. "
                "Download a Desktop app OAuth JSON from Google Cloud Console."
            )
        flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, SCOPES)
        credentials = flow.run_local_server(port=0, access_type="offline")

    TOKEN_FILE.write_text(credentials.to_json(), encoding="utf-8")
    return credentials


def parse_args():
    last_complete_day = date.today() - timedelta(days=3)
    parser = argparse.ArgumentParser(
        description="Export Google Search Console performance data to CSV."
    )
    parser.add_argument(
        "--site-url",
        default="https://www.rizqone.com/",
        help="Exact Search Console property URL, or sc-domain:example.com.",
    )
    parser.add_argument(
        "--start-date",
        default=(last_complete_day - timedelta(days=27)).isoformat(),
        help="Start date in YYYY-MM-DD format (default: last 28 complete days).",
    )
    parser.add_argument(
        "--end-date",
        default=last_complete_day.isoformat(),
        help="End date in YYYY-MM-DD format (default: three days ago).",
    )
    parser.add_argument(
        "--dimensions",
        default="query,page",
        help="Comma-separated dimensions: " + ", ".join(DIMENSION_CHOICES),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "seo-research" / "search-console.csv",
        help="CSV output path.",
    )
    args = parser.parse_args()

    try:
        start_date = date.fromisoformat(args.start_date)
        end_date = date.fromisoformat(args.end_date)
    except ValueError as error:
        parser.error(f"dates must use YYYY-MM-DD format: {error}")
    if start_date > end_date:
        parser.error("--start-date must be on or before --end-date")

    args.dimensions = [dimension.strip() for dimension in args.dimensions.split(",")]
    invalid_dimensions = set(args.dimensions) - set(DIMENSION_CHOICES)
    if not args.dimensions or invalid_dimensions:
        parser.error(
            "invalid --dimensions; choose from " + ", ".join(DIMENSION_CHOICES)
        )
    return args


def main():
    args = parse_args()
    headers = args.dimensions + ["clicks", "impressions", "ctr", "position"]
    args.output.parent.mkdir(parents=True, exist_ok=True)

    try:
        service = build(
            "searchconsole",
            "v1",
            credentials=get_credentials(),
            cache_discovery=False,
        )
        rows = []
        start_row = 0
        while True:
            response = (
                service.searchanalytics()
                .query(
                    siteUrl=args.site_url,
                    body={
                        "startDate": args.start_date,
                        "endDate": args.end_date,
                        "dimensions": args.dimensions,
                        "rowLimit": 25000,
                        "startRow": start_row,
                    },
                )
                .execute()
            )
            batch = response.get("rows", [])
            rows.extend(batch)
            if len(batch) < 25000:
                break
            start_row += len(batch)
    except HttpError as error:
        raise SystemExit(
            f"Search Console API request failed ({error.resp.status}): {error}"
        ) from error

    with args.output.open("w", newline="", encoding="utf-8-sig") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(headers)
        for row in rows:
            writer.writerow(
                row.get("keys", [])
                + [
                    row.get("clicks", 0),
                    row.get("impressions", 0),
                    row.get("ctr", 0),
                    row.get("position", 0),
                ]
            )

    print(f"Exported {len(rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
