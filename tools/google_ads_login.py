import argparse
import json
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow


ROOT = Path(__file__).resolve().parent.parent
AUTH_DIR = ROOT / ".google-seo"
CLIENT_SECRETS = AUTH_DIR / "client_secret.json"
CONFIG_FILE = ROOT / ".google-ads.yaml"
CUSTOMER_ID_FILE = ROOT / ".google-ads-customer-id"
SCOPES = ["https://www.googleapis.com/auth/adwords"]


def main():
    parser = argparse.ArgumentParser(
        description="Authorize the local Google Ads Keyword Planner tool."
    )
    parser.add_argument(
        "--customer-id",
        required=True,
        help="Google Ads customer ID (10 digits, without hyphens).",
    )
    parser.add_argument(
        "--login-customer-id",
        help="Manager account ID, if accessing the customer through an MCC.",
    )
    args = parser.parse_args()

    customer_id = args.customer_id.replace("-", "")
    if not customer_id.isdigit() or len(customer_id) != 10:
        parser.error("--customer-id must contain exactly 10 digits")
    if args.login_customer_id:
        args.login_customer_id = args.login_customer_id.replace("-", "")
        if not args.login_customer_id.isdigit() or len(args.login_customer_id) != 10:
            parser.error("--login-customer-id must contain exactly 10 digits")
    if not CLIENT_SECRETS.exists():
        raise SystemExit(
            f"OAuth client file not found: {CLIENT_SECRETS}. "
            "Download a Desktop app OAuth JSON from Google Cloud Console."
        )

    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, SCOPES)
    credentials = flow.run_local_server(port=0, access_type="offline", prompt="consent")
    if not credentials.refresh_token:
        raise SystemExit(
            "Google did not return a refresh token. Revoke this app's access in "
            "your Google Account and run the authorization task again."
        )
    client_config = flow.client_config

    values = {
        "client_id": client_config["client_id"],
        "client_secret": client_config["client_secret"],
        "refresh_token": credentials.refresh_token,
        "use_proto_plus": True,
    }
    if args.login_customer_id:
        values["login_customer_id"] = args.login_customer_id

    with CONFIG_FILE.open("w", encoding="utf-8") as config_file:
        for key, value in values.items():
            yaml_value = json.dumps(value) if isinstance(value, str) else str(value).lower()
            config_file.write(f"{key}: {yaml_value}\n")
    CUSTOMER_ID_FILE.write_text(customer_id, encoding="utf-8")

    print(f"Google Ads credentials saved to {CONFIG_FILE}")


if __name__ == "__main__":
    main()
