# App link file templates

Both files are served from `public/.well-known/` and are intentionally empty until the app is finished.
JSON cannot hold comments, so the instructions live here.

## Android App Links: `public/.well-known/assetlinks.json`

Replace `[]` with the following, filling the brackets from the finished app. Do not guess these values.

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "[ANDROID_PACKAGE_NAME]",
      "sha256_cert_fingerprints": ["[SHA256_SIGNING_CERT_FINGERPRINT]"]
    }
  }
]
```

Use the fingerprint of the Play App Signing key (Play Console > Setup > App signing).

## iOS Universal Links: `public/.well-known/apple-app-site-association`

Replace the file with the following (no file extension, served as application/json):

```json
{
  "applinks": {
    "details": [{ "appIDs": ["[APPLE_TEAM_ID].[IOS_BUNDLE_ID]"], "components": [{ "/": "/app/*" }] }]
  }
}
```

Paths in `components` must match the routes the app handles. Keep in sync with `NEXT_PUBLIC_APP_DEEP_LINK`.
