import { prisma } from '@/lib/prisma';
import { etlJobRunner } from '@/lib/etl/job-runner';
import { DummyAdapter, AmazonDummyAdapter, RakutenDummyAdapter } from '@/lib/etl/adapters/dummy-adapter';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // ETLジョブランナーにアダプタを登録
    etlJobRunner.registerAdapter(new DummyAdapter());
    etlJobRunner.registerAdapter(new AmazonDummyAdapter());
    etlJobRunner.registerAdapter(new RakutenDummyAdapter());

    // 各ストアでETLジョブを実行
    const stores = ['dummy', 'amazon', 'rakuten'];
    const searchQueries = ['おむつ', 'パンパース', 'メリーズ'];

    for (const storeSlug of stores) {
      console.log(`\n📦 Processing ${storeSlug}...`);
      
      const result = await etlJobRunner.runJob({
        storeSlug,
        searchQueries,
        maxResults: 50,
        forceRefresh: true,
      });

      console.log(`✅ ${storeSlug}: processed=${result.processed}, new=${result.newOffers}, updated=${result.updatedOffers}, errors=${result.errors}`);
    }

    // 統計情報を表示
    const stats = await getDatabaseStats();
    console.log('\n📊 Database Statistics:');
    console.log(`Products: ${stats.products}`);
    console.log(`Stores: ${stats.stores}`);
    console.log(`Offers: ${stats.offers}`);
    console.log(`Calc Snapshots: ${stats.calcSnapshots}`);
    console.log(`Calc Policies: ${stats.calcPolicies}`);

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function getDatabaseStats() {
  const [products, stores, offers, calcSnapshots, calcPolicies] = await Promise.all([
    prisma.product.count(),
    prisma.store.count(),
    prisma.offer.count(),
    prisma.calcSnapshot.count(),
    prisma.calcPolicy.count(),
  ]);

  return {
    products,
    stores,
    offers,
    calcSnapshots,
    calcPolicies,
  };
}

// スクリプトとして実行する場合
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };