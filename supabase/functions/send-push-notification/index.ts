declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

interface PushNotificationRequest {
  user_id?: string;
  title?: string;
  body?: string;
  notification_type?:
  | 'order_updates'
  | 'promotions'
  | 'wishlist_alerts'
  | 'new_arrivals';
}

function getDefaultKey(
  jsonEnvName: string,
  legacyEnvName: string,
): string {
  const jsonValue = Deno.env.get(jsonEnvName);

  if (jsonValue) {
    const keys = JSON.parse(jsonValue);
    return keys.default;
  }

  const legacyValue = Deno.env.get(legacyEnvName);

  if (!legacyValue) {
    throw new Error(`Missing ${jsonEnvName}`);
  }

  return legacyValue;
}

export default {
  async fetch(req: Request) {
    if (req.method !== "POST") {
      return Response.json(
        {
          success: false,
          error: "Method not allowed",
        },
        { status: 405 },
      );
    }

    try {
      // --------------------------------------------------
      // 1. Authenticate the caller
      // --------------------------------------------------

      const authHeader = req.headers.get("Authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        return Response.json(
          {
            success: false,
            error: "Missing authentication token.",
          },
          { status: 401 },
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

      const publishableKey = getDefaultKey(
        "SUPABASE_PUBLISHABLE_KEYS",
        "SUPABASE_ANON_KEY",
      );

      const secretKey = getDefaultKey(
        "SUPABASE_SECRET_KEYS",
        "SUPABASE_SERVICE_ROLE_KEY",
      );

      // Ask Supabase Auth who owns this JWT.
      const userResponse = await fetch(
        `${supabaseUrl}/auth/v1/user`,
        {
          method: "GET",
          headers: {
            apikey: publishableKey,
            Authorization: authHeader,
          },
        },
      );

      if (!userResponse.ok) {
        return Response.json(
          {
            success: false,
            error: "Invalid authentication token.",
          },
          { status: 401 },
        );
      }

      const user = await userResponse.json();

      // Check caller role
      const profileUrl = new URL(
        `${supabaseUrl}/rest/v1/profiles`,
      );

      profileUrl.searchParams.set(
        "select",
        "role",
      );

      profileUrl.searchParams.set(
        "id",
        `eq.${user.id}`,
      );

      profileUrl.searchParams.set(
        "limit",
        "1",
      );

      const profileResponse = await fetch(
        profileUrl.toString(),
        {
          method: "GET",
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
          },
        },
      );

      if (!profileResponse.ok) {
        const details = await profileResponse.text();

        return Response.json(
          {
            success: false,
            error: "Failed to verify caller role.",
            details,
          },
          { status: 500 },
        );
      }

      const profiles = await profileResponse.json();
      const callerRole = profiles[0]?.role ?? "customer";
      const isAdmin = callerRole === "admin";

      // --------------------------------------------------
      // 2. Read request
      // --------------------------------------------------

      const payload: PushNotificationRequest = await req.json();

      if (!payload.user_id) {
        return Response.json(
          {
            success: false,
            error: "Missing user_id.",
          },
          { status: 400 },
        );
      }

      // Users can only send to themselves.
      if (!isAdmin && payload.user_id !== user.id) {
        return Response.json(
          {
            success: false,
            error: "You can only send notifications to your own user.",
          },
          { status: 403 },
        );
      }

      if (!payload.notification_type) {
        return Response.json(
          {
            success: false,
            error: "Missing notification_type.",
          },
          { status: 400 },
        );
      }

      // 3. Check notification preferences
      const preferencesUrl = new URL(
        `${supabaseUrl}/rest/v1/notification_preferences`,
      );

      preferencesUrl.searchParams.set(
        "select",
        payload.notification_type,
      );

      preferencesUrl.searchParams.set(
        "user_id",
        `eq.${payload.user_id}`,
      );

      preferencesUrl.searchParams.set(
        "limit",
        "1",
      );

      const preferencesResponse = await fetch(
        preferencesUrl.toString(),
        {
          method: "GET",
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
          },
        },
      );

      if (!preferencesResponse.ok) {
        const details = await preferencesResponse.text();

        return Response.json(
          {
            success: false,
            error: "Failed to read notification preferences.",
            details,
          },
          { status: 500 },
        );
      }

      const preferences = await preferencesResponse.json();
      const preferenceEnabled =
        preferences[0]?.[payload.notification_type] ?? false;

      if (!preferenceEnabled) {
        return Response.json({
          success: true,
          skipped: true,
          reason: "Notification preference is disabled.",
        });
      }
      // --------------------------------------------------
      // 4. Find user's Expo push token
      // --------------------------------------------------

      const tokenUrl = new URL(
        `${supabaseUrl}/rest/v1/device_tokens`,
      );

      tokenUrl.searchParams.set(
        "select",
        "expo_push_token",
      );

      tokenUrl.searchParams.set(
        "user_id",
        `eq.${payload.user_id}`,
      );

      tokenUrl.searchParams.set(
        "order",
        "updated_at.desc",
      );

      tokenUrl.searchParams.set(
        "limit",
        "1",
      );

      const tokenResponse = await fetch(
        tokenUrl.toString(),
        {
          method: "GET",
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
          },
        },
      );

      if (!tokenResponse.ok) {
        const details = await tokenResponse.text();

        return Response.json(
          {
            success: false,
            error: "Failed to find device token.",
            details,
          },
          { status: 500 },
        );
      }

      const tokens = await tokenResponse.json();

      const expoPushToken = tokens[0]?.expo_push_token;

      if (!expoPushToken) {
        return Response.json(
          {
            success: false,
            error: "No Expo push token found for this user.",
          },
          { status: 404 },
        );
      }

      // --------------------------------------------------
      // 4. Send notification through Expo
      // --------------------------------------------------

      const expoResponse = await fetch(
        "https://exp.host/--/api/v2/push/send",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: expoPushToken,
            title: payload.title ?? "Reloved Gold ✨",
            body: payload.body ?? "You have a new notification.",
            sound: "default",
          }),
        },
      );

      const expoResult = await expoResponse.json();

      return Response.json(
        {
          success: expoResponse.ok,
          expo: expoResult,
        },
        { status: expoResponse.status },
      );

    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error instanceof Error
            ? error.message
            : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
};