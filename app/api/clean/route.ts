import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { defaultProducts } from '@/lib/data/catalog';

function getRedisClient() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!redisUrl || !redisToken) return null;
  return new Redis({ url: redisUrl.trim(), token: redisToken.trim() });
}

export async function GET() {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ success: false, message: 'Redis non configuré' });
    }

    // On force l'écrasement immédiat de catalog.json par les produits par défaut
    // Cela supprimera instantanément toute image Base64 géante qui fait planter le serveur.
    await redis.set('catalog.json', JSON.stringify(defaultProducts));

    return NextResponse.json({ 
      success: true, 
      message: 'Base de données nettoyée avec succès. Le site devrait maintenant fonctionner à 100%.' 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
