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
    accountAssociation: {
      header: `farcaster:verify:${APP_URL?.replace('https://', '').replace('http://', '')}`
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
