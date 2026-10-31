import { db, initSchema } from './db';
import crypto from 'crypto';

export function seedDatabase() {
  initSchema();

  // Clear existing data to ensure clean seed
  db.exec(`
    DELETE FROM clicks;
    DELETE FROM alerts;
    DELETE FROM subscribers;
    DELETE FROM collection_items;
    DELETE FROM collections;
    DELETE FROM price_points;
    DELETE FROM offers;
    DELETE FROM products;
  `);

  const now = new Date();

  // Seed sample products across the 4 launch categories
  // 1. Power & Charging
  // 2. Smart Home
  // 3. Audio
  // 4. Desk & Workspace

  const productsData = [
    {
      id: crypto.randomUUID(),
      slug: 'anker-prime-20000mah-power-bank',
      title: 'Anker Prime 20,000mAh Power Bank (200W Output)',
      brand: 'Anker',
      category: 'power_charging',
      gtin: '0194644143213',
      image_url: 'https://images.unsplash.com/photo-1609592424368-80e22709292d?auto=format&fit=crop&w=600&q=80',
      specs: JSON.stringify({
        Capacity: '20,000 mAh',
        'Max Output': '200W',
        Ports: '2x USB-C, 1x USB-A',
        Weight: '1.19 lbs',
      }),
      verdict_text: 'The best high-output travel power bank for laptops and phones alike.',
      pros: JSON.stringify(['Blazing fast 100W dual charging', 'Informative smart display', 'Compact footprint']),
      cons: JSON.stringify(['Heavier than basic banks', 'Premium price tag', 'No built-in cable']),
      best_for: 'Frequent flyers and power users needing laptop charging on the go.',
      avoid_if: 'You only need a lightweight pocket charger for emergency phone top-ups.',
      tested: 1,
      editor_rating: 5,
      tested_disclosure: 'purchased',
      author_name: 'Alex Rivera',
      author_bio: 'Senior Hardware Editor with 8 years evaluating mobile charging tech.',
      status: 'published',
      regularPrice: 129.99,
      currentPrice: 89.99, // Great price (~31% below regular)
      lowestUsed: 78.00,
      historyPattern: 'great_deal',
    },
    {
      id: crypto.randomUUID(),
      slug: 'ugreen-nexode-65w-gan-charger',
      title: 'UGREEN Nexode 65W GaN 3-Port Wall Charger',
      brand: 'UGREEN',
      category: 'power_charging',
      gtin: '0850036640192',
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      specs: JSON.stringify({
        'Max Output': '65W',
        Ports: '2x USB-C, 1x USB-A',
        Technology: 'GaNFast III',
        Foldable: 'Yes (US prongs)',
      }),
      verdict_text: 'Compact, efficient multi-device charger that replaces the bulky factory bricks.',
      pros: JSON.stringify(['Foldable prongs', 'Runs cool under load', 'Charges phone + laptop simultaneously']),
      cons: JSON.stringify(['Port 3 splits power heavily', 'Slightly wide for stacked wall outlets', 'Basic cable not included']),
      best_for: 'Minimalists and one-bag travelers wanting one single adapter.',
      avoid_if: 'You need 140W fast-charging for full-sized 16-inch MacBooks.',
      tested: 1,
      editor_rating: 4,
      tested_disclosure: 'loaner: UGREEN',
      author_name: 'Alex Rivera',
      author_bio: 'Senior Hardware Editor with 8 years evaluating mobile charging tech.',
      status: 'published',
      regularPrice: 49.99,
      currentPrice: 42.99, // Good price (~14% below regular)
      lowestUsed: 37.50,
      historyPattern: 'good_deal',
    },
    {
      id: crypto.randomUUID(),
      slug: 'aqara-door-window-sensor-p2',
      title: 'Aqara Door and Window Sensor P2 (Matter over Thread)',
      brand: 'Aqara',
      category: 'smart_home',
      gtin: '0810141650033',
      image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
      specs: JSON.stringify({
        Protocol: 'Matter over Thread',
        Battery: 'CR123A (up to 2 years)',
        Compatibility: 'Apple Home, Google Home, Alexa, SmartThings',
      }),
      verdict_text: 'Rock-solid contact sensor without proprietary bridge lock-in.',
      pros: JSON.stringify(['Native Matter over Thread', 'Long battery life', 'Instant local responsiveness']),
      cons: JSON.stringify(['Requires existing Thread Border Router', 'Slightly bulkier than Zigbee model', 'Higher unit cost']),
      best_for: 'Smart homeowners wanting future-proof, local-first automation.',
      avoid_if: 'You do not own an Apple TV, HomePod, or Matter-capable hub.',
      tested: 0,
      editor_rating: 4,
      tested_disclosure: null,
      author_name: 'Jordan Lee',
      author_bio: 'IoT Specialist and Smart Home Automation Contributor.',
      status: 'published',
      regularPrice: 29.99,
      currentPrice: 29.99, // Typical price
      lowestUsed: 25.00,
      historyPattern: 'typical',
    },
    {
      id: crypto.randomUUID(),
      slug: 'sony-wh-ch720n-headphones',
      title: 'Sony WH-CH720N Noise-Canceling Wireless Headphones',
      brand: 'Sony',
      category: 'audio',
      gtin: '0027242925182',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      specs: JSON.stringify({
        Battery: 'Up to 35 hours (ANC on)',
        Bluetooth: '5.2 with Multipoint',
        Weight: '192g',
        Processor: 'Integrated Processor V1',
      }),
      verdict_text: 'Class-leading comfort and noise isolation for under $150.',
      pros: JSON.stringify(['Featherweight comfort', 'Flagship V1 noise cancelation chip', 'Crisp mic for calls']),
      cons: JSON.stringify(['Plastic build feel', 'Does not fold completely flat', 'Bass is somewhat polite out of the box']),
      best_for: 'Office workers and students seeking all-day comfort without spending $350.',
      avoid_if: 'You demand metallic luxury build or workout water-resistance.',
      tested: 1,
      editor_rating: 4,
      tested_disclosure: 'purchased',
      author_name: 'Morgan Taylor',
      author_bio: 'Audio Engineer and consumer audio product reviewer.',
      status: 'published',
      regularPrice: 149.99,
      currentPrice: 98.00, // Great price (~34% off)
      lowestUsed: 85.00,
      historyPattern: 'great_deal',
    },
    {
      id: crypto.randomUUID(),
      slug: 'logitech-mx-master-3s',
      title: 'Logitech MX Master 3S Wireless Performance Mouse',
      brand: 'Logitech',
      category: 'desk_workspace',
      gtin: '0097855174412',
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
      specs: JSON.stringify({
        Sensor: '8,000 DPI Darkfield',
        Clicks: '90% Quiet Click tech',
        Scroll: 'MagSpeed Electromagnetic',
        Battery: 'Up to 70 days',
      }),
      verdict_text: 'The gold standard ergonomic productivity mouse, period.',
      pros: JSON.stringify(['Whisper-quiet clicks', 'Incredible MagSpeed scroll wheel', 'Flawless gesture ergonomics']),
      cons: JSON.stringify(['Right-handed only', 'Rubber coating shows wear over years', 'Price rarely dips deeply']),
      best_for: 'Anyone working at a desk 8+ hours a day with spreadsheets or creative apps.',
      avoid_if: 'You are left-handed or primarily play fast-twitch competitive games.',
      tested: 1,
      editor_rating: 5,
      tested_disclosure: 'purchased',
      author_name: 'Jordan Lee',
      author_bio: 'Desk setup enthusiast and ergonomics reviewer.',
      status: 'published',
      regularPrice: 99.99,
      currentPrice: 119.99, // Above typical (inflated / supply pinch)
      lowestUsed: 89.00,
      historyPattern: 'above_typical',
    },
    {
      id: crypto.randomUUID(),
      slug: 'anker-solix-c300-dc-power-station',
      title: 'Anker SOLIX C300 DC Portable Power Station (288Wh)',
      brand: 'Anker',
      category: 'power_charging',
      gtin: '0194644199999',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      specs: JSON.stringify({
        Capacity: '288Wh LiFePO4',
        Output: '300W Max DC/USB-C',
        'Cycle Life': '3,000+ cycles to 80%',
      }),
      verdict_text: 'Super-compact outdoor station for car camping and remote field work.',
      pros: JSON.stringify(['LFP battery chemistry', 'Built-in strap and lantern', 'Dual 140W USB-C bidirectional ports']),
      cons: JSON.stringify(['No AC wall outlets (DC only model)', 'Recharges slower from low-wattage solar']),
      best_for: 'Campers and tech travelers whose gear is completely USB-C powered.',
      avoid_if: 'You need to power household AC appliances like blenders or CPAP AC bricks.',
      tested: 0,
      editor_rating: 4,
      tested_disclosure: null,
      author_name: 'Alex Rivera',
      author_bio: 'Senior Hardware Editor with 8 years evaluating mobile charging tech.',
      status: 'published',
      regularPrice: 199.99,
      currentPrice: 159.99,
      lowestUsed: 145.00,
      historyPattern: 'cold_start', // Only 5 days of history -> will result in unknown verdict
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, slug, title, brand, category, gtin, image_url, specs,
      verdict_text, pros, cons, best_for, avoid_if, tested, editor_rating,
      tested_disclosure, author_name, author_bio, status, created_at, updated_at
    ) VALUES (
      @id, @slug, @title, @brand, @category, @gtin, @image_url, @specs,
      @verdict_text, @pros, @cons, @best_for, @avoid_if, @tested, @editor_rating,
      @tested_disclosure, @author_name, @author_bio, @status, @created_at, @updated_at
    )
  `);

  const insertOffer = db.prepare(`
    INSERT INTO offers (
      id, product_id, merchant, merchant_sku, affiliate_url, current_price,
      lowest_used_price, in_stock, rating, review_count, price_checked_at
    ) VALUES (
      @id, @product_id, @merchant, @merchant_sku, @affiliate_url, @current_price,
      @lowest_used_price, @in_stock, @rating, @review_count, @price_checked_at
    )
  `);

  const insertPricePoint = db.prepare(`
    INSERT INTO price_points (
      offer_id, price, captured_at, source
    ) VALUES (
      @offer_id, @price, @captured_at, @source
    )
  `);

  const insertCollection = db.prepare(`
    INSERT INTO collections (id, slug, title, intro, published, updated_at)
    VALUES (@id, @slug, @title, @intro, @published, @updated_at)
  `);

  const insertCollectionItem = db.prepare(`
    INSERT INTO collection_items (collection_id, product_id, position, editor_note)
    VALUES (@collection_id, @product_id, @position, @editor_note)
  `);

  for (const p of productsData) {
    const createdAt = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString();
    insertProduct.run({
      id: p.id,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      category: p.category,
      gtin: p.gtin,
      image_url: p.image_url,
      specs: p.specs,
      verdict_text: p.verdict_text,
      pros: p.pros,
      cons: p.cons,
      best_for: p.best_for,
      avoid_if: p.avoid_if,
      tested: p.tested,
      editor_rating: p.editor_rating,
      tested_disclosure: p.tested_disclosure,
      author_name: p.author_name,
      author_bio: p.author_bio,
      status: p.status,
      created_at: createdAt,
      updated_at: now.toISOString(),
    });

    // Create primary Amazon offer
    const amazonOfferId = crypto.randomUUID();
    insertOffer.run({
      id: amazonOfferId,
      product_id: p.id,
      merchant: 'amazon',
      merchant_sku: `B0${p.gtin?.slice(-8) || 'TESTASIN'}`,
      affiliate_url: `https://www.amazon.com/dp/B0${p.gtin?.slice(-8) || 'TESTASIN'}?tag=gadgetpulse-20`,
      current_price: p.currentPrice,
      lowest_used_price: p.lowestUsed,
      in_stock: 1,
      rating: 4.5,
      review_count: 512,
      price_checked_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    });

    // Create secondary Walmart / Best Buy offer
    const walmartOfferId = crypto.randomUUID();
    insertOffer.run({
      id: walmartOfferId,
      product_id: p.id,
      merchant: 'walmart',
      merchant_sku: `WM-${p.gtin?.slice(-6) || '9999'}`,
      affiliate_url: `https://www.walmart.com/ip/${p.slug}/12345678`,
      current_price: Number((p.currentPrice + 2.5).toFixed(2)),
      lowest_used_price: null,
      in_stock: 1,
      rating: 4.4,
      review_count: 140,
      price_checked_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    });

    // Generate price history points
    const historyDays = p.historyPattern === 'cold_start' ? 6 : 90;
    for (let day = historyDays; day >= 1; day--) {
      const ptDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000).toISOString();
      let price = p.regularPrice;

      if (p.historyPattern === 'great_deal') {
        // Drop price in last 3 days
        price = day <= 3 ? p.currentPrice : p.regularPrice;
      } else if (p.historyPattern === 'good_deal') {
        price = day <= 4 ? p.currentPrice : p.regularPrice;
      } else if (p.historyPattern === 'above_typical') {
        // Price spiked in last week
        price = day <= 7 ? p.currentPrice : p.regularPrice;
      } else {
        price = p.regularPrice;
      }

      insertPricePoint.run({
        offer_id: amazonOfferId,
        price,
        captured_at: ptDate,
        source: day > 10 ? 'backfill' : 'api',
      });
    }
  }

  // Create Collections
  const col1Id = crypto.randomUUID();
  insertCollection.run({
    id: col1Id,
    slug: 'best-power-banks-under-100',
    title: 'Best Power Banks and Portable Chargers Under $100',
    intro:
      'We track 90-day pricing, watt-hour efficiency, and charging protocols across dozens of power banks. Here are our top-rated recommendations that deliver genuine value without marketing gimmicks.',
    published: 1,
    updated_at: now.toISOString(),
  });

  const col2Id = crypto.randomUUID();
  insertCollection.run({
    id: col2Id,
    slug: 'best-desk-accessories-under-150',
    title: 'Best Desk and Workspace Accessories Under $150',
    intro:
      'Transform your daily workstation with ergonomic peripherals, high-speed docks, and precision lighting evaluated for long-term reliability and verified price drops.',
    published: 1,
    updated_at: now.toISOString(),
  });

  // Link products to collections
  const p1 = productsData[0]; // Anker Prime
  const p2 = productsData[1]; // UGREEN Nexode
  const p5 = productsData[4]; // MX Master 3S

  insertCollectionItem.run({
    collection_id: col1Id,
    product_id: p1.id,
    position: 1,
    editor_note: 'Our top pick for laptop fast-charging on flights.',
  });

  insertCollectionItem.run({
    collection_id: col1Id,
    product_id: p2.id,
    position: 2,
    editor_note: 'Runner up: best compact GaN wall adapter for travel.',
  });

  insertCollectionItem.run({
    collection_id: col2Id,
    product_id: p5.id,
    position: 1,
    editor_note: 'Unmatched ergonomics and silent operation for power users.',
  });
}
