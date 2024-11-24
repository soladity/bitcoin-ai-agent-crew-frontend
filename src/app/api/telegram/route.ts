import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramUserId = searchParams.get('telegram_user_id');
    const telegramChatId = searchParams.get('telegram_chat_id');

    // Validate required parameters
    if (!telegramUserId || !telegramChatId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Get the current user's session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if telegram user already exists
    const { data: existingTelegramUser, error: fetchError } = await supabase
      .from('telegram_users')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is the error code for no rows returned
      return NextResponse.json(
        { error: 'Error checking existing telegram user' },
        { status: 500 }
      );
    }

    if (existingTelegramUser?.is_registered) {
      return NextResponse.json(
        { error: 'Telegram user already registered' },
        { status: 400 }
      );
    }

    // Create or update telegram user record
    const { error: upsertError } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_user_id: telegramUserId,
        telegram_chat_id: telegramChatId,
        profile_id: user.id,
        is_registered: true,
      });

    if (upsertError) {
      return NextResponse.json(
        { error: 'Error updating telegram user', upsertError },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
