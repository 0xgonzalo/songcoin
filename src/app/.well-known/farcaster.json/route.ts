import { NextResponse } from 'next/server';
import {
  APP_URL,
  APP_NAME,
  APP_DESCRIPTION,
  APP_PRIMARY_CATEGORY,
  APP_TAGS,
  APP_ICON_URL,
  APP_SPLASH_URL,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_BUTTON_TEXT,
  APP_WEBHOOK_URL,
} from '../../../lib/constants';

export async function GET() {
  const manifest = {
      "accountAssociation": {
        "header": "eyJmaWQiOjM1NTU4OCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEI2QTUwRGI1MkY3MDNkYkIwMDlGMDNGNkViN2Y1NThmMTEwQzliMEQifQ",
        "payload": "eyJkb21haW4iOiJzb25nY29pbi52ZXJjZWwuYXBwIn0",
        "signature": "N6bJKK/q3vTMo5Sm2lYEcT3O3A3sz/gdXpqoa2C/UC0ZLgbXmDj8e7GQLrmgIk+2RQ1H+gg7JOQi176dgn7fhRs="
      },
    frame: {
      version: 'next',
      name: APP_NAME,
      iconUrl: APP_ICON_URL,
      buttonTitle: APP_BUTTON_TEXT || 'Launch Songcoin',
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      homeUrl: APP_URL,
      webhookUrl: APP_WEBHOOK_URL,
    },
    miniApp: {
      name: APP_NAME,
      description: APP_DESCRIPTION,
      iconUrl: APP_ICON_URL,
      primaryCategory: APP_PRIMARY_CATEGORY || 'music',
      tags: APP_TAGS || ['music', 'crypto', 'trading'],
      url: APP_URL,
      buttonTitle: APP_BUTTON_TEXT || 'Launch Songcoin',
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
    }
  };

  return NextResponse.json(manifest);
}
