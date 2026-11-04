import argparse
import csv
from datetime import date
from pathlib import Path

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = ROOT / ".google-ads.yaml"
CUSTOMER_ID_FILE = ROOT / ".google-ads-customer-id"
DEFAULT_KEYWORDS = (
    "SEO agency Kolkata, digital marketing agency Kolkata, SEO services India, "
    "AEO services India, GEO services India, link building agency India"
)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Get Google Keyword Planner ideas and historical metrics."
    )
    parser.add_argument(
        "--keywords",
        help="Comma-separated seed keywords (defaults to RizqOne SEO/AEO/GEO terms).",
    )
    parser.add_argument(
        "--site-url",
        help="Optional website seed URL, for example https://www.rizqone.com/services.html.",
    )
    parser.add_argument(
        "--location",
        default="Kolkata",
        help="Google Ads location name to target (default: Kolkata).",
    )
    parser.add_argument(
        "--location-id",
        help="Use a known Google Ads geo target ID instead of searching by name.",
    )
    parser.add_argument(
        "--country-code",
        default="IN",
        help="ISO country code used when resolving the location (default: IN).",
    )
    parser.add_argument(
        "--language-id",
        default="1000",
        help="Google Ads language ID (1000 is English; 1001 is Bengali).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "seo-research" / f"keyword-ideas-{date.today():%Y%m%d}.csv",
        help="CSV output path.",
    )
    args = parser.parse_args()
    args.keywords = (
        [keyword.strip() for keyword in args.keywords.split(",") if keyword.strip()]
        if args.keywords
        else []
    )
    if not args.keywords and not args.site_url:
        args.keywords = [keyword.strip() for keyword in DEFAULT_KEYWORDS.split(",")]
    if not args.language_id.isdigit():
        parser.error("--language-id must be a Google Ads language ID")
    if args.location_id and not args.location_id.isdigit():
        parser.error("--location-id must be numeric")
    return args


def resolve_location(client, args):
    if args.location_id:
        return f"geoTargetConstants/{args.location_id}"

    service = client.get_service("GeoTargetConstantService")
    response = service.suggest_geo_target_constants(
        locale="en",
        country_code=args.country_code.upper(),
        location_names=[args.location],
    )
    exact_matches = [
        suggestion.geo_target_constant
        for suggestion in response.geo_target_constant_suggestions
        if suggestion.geo_target_constant.name.casefold() == args.location.casefold()
        and suggestion.geo_target_constant.target_type == "City"
    ]
    if len(exact_matches) == 1:
        location = exact_matches[0]
        print(
            f"Using location: {location.name}, {location.country_code} "
            f"(geo target {location.id})"
        )
        return location.resource_name

    choices = [
        f"{suggestion.geo_target_constant.name} "
        f"({suggestion.geo_target_constant.target_type}, "
        f"{suggestion.geo_target_constant.country_code}, "
        f"id={suggestion.geo_target_constant.id})"
        for suggestion in response.geo_target_constant_suggestions
    ]
    if not choices:
        raise SystemExit(
            f"No Google Ads location matched {args.location!r}. "
            "Try a different --location or provide --location-id."
        )
    raise SystemExit(
        f"Location {args.location!r} is ambiguous. Choose the desired ID with "
        f"--location-id. Suggestions: {'; '.join(choices)}"
    )


def main():
    args = parse_args()
    if not CONFIG_FILE.exists() or not CUSTOMER_ID_FILE.exists():
        raise SystemExit(
            f"Google Ads credentials not found: {CONFIG_FILE} or {CUSTOMER_ID_FILE}. "
            "Run tools\\google_ads_login.py --customer-id YOUR_CUSTOMER_ID first."
        )

    try:
        client = GoogleAdsClient.load_from_storage(path=str(CONFIG_FILE))
        customer_id = CUSTOMER_ID_FILE.read_text(encoding="utf-8").strip()
        location = resolve_location(client, args)
        service = client.get_service("KeywordPlanIdeaService")
        request = client.get_type("GenerateKeywordIdeasRequest")
        request.customer_id = customer_id
        request.language = f"languageConstants/{args.language_id}"
        request.geo_target_constants.append(location)
        request.include_adult_keywords = False
        request.keyword_plan_network = (
            client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
        )

        if args.site_url and args.keywords:
            request.keyword_and_url_seed.url = args.site_url
            request.keyword_and_url_seed.keywords.extend(args.keywords)
        elif args.site_url:
            request.url_seed.url = args.site_url
        else:
            request.keyword_seed.keywords.extend(args.keywords)

        ideas = service.generate_keyword_ideas(request=request)
    except GoogleAdsException as error:
        details = "; ".join(
            f"{item.error_code}: {item.message}" for item in error.failure.errors
        )
        raise SystemExit(
            f"Google Ads API request failed (request ID {error.request_id}): {details}"
        ) from error

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8-sig") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(
            [
                "keyword",
                "avg_monthly_searches",
                "competition",
                "low_top_of_page_bid_micros",
                "high_top_of_page_bid_micros",
                "location",
                "language_id",
            ]
        )
        for idea in ideas:
            metrics = idea.keyword_idea_metrics
            writer.writerow(
                [
                    idea.text,
                    metrics.avg_monthly_searches,
                    metrics.competition.name,
                    metrics.low_top_of_page_bid_micros,
                    metrics.high_top_of_page_bid_micros,
                    location,
                    args.language_id,
                ]
            )

    print(f"Exported keyword ideas to {args.output}")


if __name__ == "__main__":
    main()
