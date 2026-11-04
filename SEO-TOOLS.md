# Google Search and Analytics tools

This workspace includes local, read-only tools for Google Search Console,
Google Ads Keyword Planner, and the official Google Analytics MCP server. The
API tools return account-specific data; they do not guarantee rankings or
keyword volumes.

## One-time setup

1. In Google Cloud Console, choose or create a project. Enable **Google Search
   Console API**, **Google Ads API**, **Google Analytics Admin API**, and
   **Google Analytics Data API**.
2. Create an OAuth client ID of type **Desktop app**.
3. Save the downloaded OAuth JSON as
   `.google-seo/client_secret.json` in this workspace. The folder can be created
   manually; it is ignored by Git.
4. Install the Google Cloud CLI, then authenticate for Google Analytics with
   read-only access:

   ```powershell
   gcloud auth application-default login --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform" --client-id-file="C:\rizqsite\.google-seo\client_secret.json"
   ```

5. Grant the Google account access to the exact Search Console property and at
   least **Viewer** access to the GA4 property.
6. In VS Code, run **Terminal: Run Task** → **Google Analytics MCP: install**.
   The official `analytics-mcp` package is installed in the workspace's ignored
   `.venv` directory.
7. Open **Chat: Open MCP Servers** or **MCP: List Servers**, start
   `google-analytics`, and enter the Google Cloud project ID when prompted.
8. Run **SEO tools: install API clients** if not already installed.
9. Run **Google Ads: authorize Keyword Planner**, enter the 10-digit customer
   ID, and approve access in the browser. If using a manager account, run
   `python tools\google_ads_login.py --customer-id CUSTOMER_ID --login-customer-id MANAGER_ID`
   in the integrated terminal instead.
10. Google Ads API access for the Cloud project must permit the account type
    you query; a test-only API access level can query test accounts, not
    production accounts. API access level is managed on the Google Ads API
    Overview page for the Cloud project.

The Search Console export targets the supplied property URL,
`https://www.rizqone.com/`. Its first run opens a separate OAuth authorization
flow and stores a read-only token locally. The earlier Google Ads setup also
uses the Desktop OAuth client file.

OAuth tokens and the Google Ads client configuration are saved locally in
`.google-seo/`, `.google-ads.yaml`, and `.venv/`; these are ignored by Git.
Never commit or share credentials.

## Use in VS Code

- **Google Search Console: export last 28 days** exports query/page performance
  for `https://www.rizqone.com/` by default.
- **Google Ads: get Kolkata keyword ideas** uses English keywords and Kolkata
  targeting by default. It includes starter seeds for SEO, AEO, GEO, and
  link-building research.
- **Google Analytics MCP** is a read-only VS Code MCP server for GA4 reports,
  property discovery, metadata, and realtime data. It requires the Google
  Cloud CLI ADC login above and a Google Cloud project ID when the MCP server
  starts. Use its `get_account_summaries` tool to discover accessible GA4
  properties, then pass the numeric GA4 property ID to report tools.

Run the export and keyword tasks from **Terminal: Run Task**. CSV results are saved under
`seo-research/` and can be opened in VS Code or a spreadsheet.

### Search Console options

```powershell
python tools\search_console.py --site-url "sc-domain:rizqone.com" --start-date 2026-01-01 --end-date 2026-01-31 --dimensions query,page,country,device
```

The `--site-url` must exactly match a property the authorized user can access.
The default property is `https://www.rizqone.com/`. The script requests
read-only Search Console access and saves its token locally on first use.

### Keyword Planner options

```powershell
python tools\keyword_planner.py --keywords "SEO agency Kolkata, AEO services India" --location India
python tools\keyword_planner.py --location India --language-id 1001
python tools\keyword_planner.py --location-id GEO_TARGET_ID
```

The tool resolves location names through Google's location suggestions. If a
name is ambiguous, it prints the matching geo target IDs; rerun with the
intended `--location-id`. Language ID `1000` is English and `1001` is Bengali.
The account configuration created by the authorization task is stored locally
and is never placed in source code.

### GA4 MCP access

The MCP server is Google's official read-only [`analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp)
package. It uses Application Default Credentials at
`%APPDATA%\gcloud\application_default_credentials.json` and the
`GOOGLE_CLOUD_PROJECT` value you enter when VS Code starts the server. Enable
both `analyticsadmin.googleapis.com` and `analyticsdata.googleapis.com` in
that Cloud project. Grant the authenticating Google account at least the GA4
property **Viewer** role. The MCP connection is separate from the Search
Console export; both use the same local Desktop OAuth client JSON but request
their own read-only authorization scopes.
