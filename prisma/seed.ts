import { prisma } from '../src/lib/db';

async function main() {
  console.log('Starting to seed the database...');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.pages.deleteMany({});
  await prisma.chapters.deleteMany({});
  await prisma.comic_Genres.deleteMany({});
  await prisma.comic_Authors.deleteMany({});
  await prisma.comic_Publishers.deleteMany({});
  await prisma.comics.deleteMany({});
  await prisma.genres.deleteMany({});
  await prisma.authors.deleteMany({});
  await prisma.publishers.deleteMany({});

  // Create genres
  console.log('Creating genres...');
  const genres = await Promise.all([
    prisma.genres.create({
      data: {
        name: 'Action',
        slug: 'action',
        description:
          'Action manga typically feature high-energy scenes and physical confrontations.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Adventure',
        slug: 'adventure',
        description: 'Adventure manga focus on journeys, quests, and exploration.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Comedy',
        slug: 'comedy',
        description: 'Comedy manga aim to make readers laugh through humor and funny situations.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Drama',
        slug: 'drama',
        description: 'Drama manga deal with emotional and serious themes.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Fantasy',
        slug: 'fantasy',
        description: 'Fantasy manga involve magical elements and supernatural worlds.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Horror',
        slug: 'horror',
        description: 'Horror manga aim to frighten readers with scary and disturbing content.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Romance',
        slug: 'romance',
        description: 'Romance manga focus on romantic relationships and love stories.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Sci-Fi',
        slug: 'sci-fi',
        description: 'Science fiction manga explore futuristic concepts and technology.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Slice of Life',
        slug: 'slice-of-life',
        description: 'Slice of life manga depict everyday experiences and realistic situations.',
      },
    }),
    prisma.genres.create({
      data: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports manga focus on athletic competitions and sports-related themes.',
      },
    }),
  ]);

  // Create authors
  console.log('Creating authors...');
  const authors = await Promise.all([
    prisma.authors.create({
      data: {
        name: 'Eiichiro Oda',
        slug: 'eiichiro-oda',
        bio: 'Creator of One Piece, one of the best-selling manga series of all time.',
      },
    }),
    prisma.authors.create({
      data: {
        name: 'Masashi Kishimoto',
        slug: 'masashi-kishimoto',
        bio: 'Creator of Naruto, a globally popular ninja-themed manga series.',
      },
    }),
    prisma.authors.create({
      data: {
        name: 'Akira Toriyama',
        slug: 'akira-toriyama',
        bio: 'Creator of Dragon Ball, one of the most influential manga series.',
      },
    }),
    prisma.authors.create({
      data: {
        name: 'Hajime Isayama',
        slug: 'hajime-isayama',
        bio: 'Creator of Attack on Titan, a dark fantasy manga series.',
      },
    }),
    prisma.authors.create({
      data: {
        name: 'Kentaro Miura',
        slug: 'kentaro-miura',
        bio: 'Creator of Berserk, a dark fantasy manga known for its detailed artwork.',
      },
    }),
  ]);

  // Create publishers
  console.log('Creating publishers...');
  const publishers = await Promise.all([
    prisma.publishers.create({
      data: {
        name: 'Shueisha',
        slug: 'shueisha',
        description:
          'Japanese publishing company and publisher of manga magazines like Weekly Shōnen Jump.',
      },
    }),
    prisma.publishers.create({
      data: {
        name: 'Kodansha',
        slug: 'kodansha',
        description: 'One of the largest publishing companies in Japan.',
      },
    }),
    prisma.publishers.create({
      data: {
        name: 'Shogakukan',
        slug: 'shogakukan',
        description: 'Major Japanese publisher of manga, magazines, and other books.',
      },
    }),
    prisma.publishers.create({
      data: {
        name: 'Viz Media',
        slug: 'viz-media',
        description: 'American manga publisher and anime distributor.',
      },
    }),
  ]);

  // Create comics
  console.log('Creating comics...');
  const comics = await Promise.all([
    prisma.comics.create({
      data: {
        title: 'One Piece',
        slug: 'one-piece',
        description:
          'The story follows the adventures of Monkey D. Luffy, a boy whose body gained the properties of rubber after unintentionally eating a Devil Fruit. With his crew of pirates, named the Straw Hat Pirates, Luffy explores the Grand Line in search of the world\'s ultimate treasure known as "One Piece" to become the next Pirate King.',
        cover_image_url: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
        status: 'ongoing',
        country_of_origin: 'Japan',
        age_rating: 'Teen',
        total_views: 10000,
        total_favorites: 5000,
        last_chapter_uploaded_at: new Date(),
      },
    }),
    prisma.comics.create({
      data: {
        title: 'Naruto',
        slug: 'naruto',
        description:
          "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja.",
        cover_image_url: 'https://cdn.myanimelist.net/images/manga/3/117681.jpg',
        status: 'completed',
        country_of_origin: 'Japan',
        age_rating: 'Teen',
        total_views: 9000,
        total_favorites: 4500,
        last_chapter_uploaded_at: new Date(),
      },
    }),
    prisma.comics.create({
      data: {
        title: 'Dragon Ball',
        slug: 'dragon-ball',
        description:
          'Dragon Ball tells the tale of a young warrior by the name of Son Goku, a young peculiar boy with a tail who embarks on a quest to become stronger and learns of the Dragon Balls, when, once all 7 are gathered, grant a wish.',
        cover_image_url: 'https://cdn.myanimelist.net/images/manga/2/54545.jpg',
        status: 'completed',
        country_of_origin: 'Japan',
        age_rating: 'Teen',
        total_views: 8500,
        total_favorites: 4200,
        last_chapter_uploaded_at: new Date(),
      },
    }),
    prisma.comics.create({
      data: {
        title: 'Attack on Titan',
        slug: 'attack-on-titan',
        description:
          'In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason, a young boy named Eren Yeager vows to cleanse the world of the giant humanoid Titans that have brought humanity to the brink of extinction.',
        cover_image_url: 'https://cdn.myanimelist.net/images/manga/2/37846.jpg',
        status: 'completed',
        country_of_origin: 'Japan',
        age_rating: 'Mature',
        total_views: 7800,
        total_favorites: 3900,
        last_chapter_uploaded_at: new Date(),
      },
    }),
    prisma.comics.create({
      data: {
        title: 'Berserk',
        slug: 'berserk',
        description:
          'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge. After a tumultuous childhood, he finally finds someone he respects and believes he can trust, only to have everything fall apart when this person takes away everything important to Guts for the purpose of fulfilling his own desires.',
        cover_image_url: 'https://cdn.myanimelist.net/images/manga/1/157897.jpg',
        status: 'ongoing',
        country_of_origin: 'Japan',
        age_rating: 'Mature',
        total_views: 7200,
        total_favorites: 3600,
        last_chapter_uploaded_at: new Date(),
      },
    }),
  ]);

  // Associate comics with genres, authors, and publishers
  console.log('Creating associations...');

  // One Piece associations
  await prisma.comic_Genres.createMany({
    data: [
      { comic_id: comics[0].id, genre_id: genres[0].id }, // Action
      { comic_id: comics[0].id, genre_id: genres[1].id }, // Adventure
      { comic_id: comics[0].id, genre_id: genres[2].id }, // Comedy
      { comic_id: comics[0].id, genre_id: genres[4].id }, // Fantasy
    ],
  });

  await prisma.comic_Authors.create({
    data: { comic_id: comics[0].id, author_id: authors[0].id, role: 'Story & Art' },
  });

  await prisma.comic_Publishers.create({
    data: { comic_id: comics[0].id, publisher_id: publishers[0].id },
  });

  // Naruto associations
  await prisma.comic_Genres.createMany({
    data: [
      { comic_id: comics[1].id, genre_id: genres[0].id }, // Action
      { comic_id: comics[1].id, genre_id: genres[1].id }, // Adventure
      { comic_id: comics[1].id, genre_id: genres[4].id }, // Fantasy
    ],
  });

  await prisma.comic_Authors.create({
    data: { comic_id: comics[1].id, author_id: authors[1].id, role: 'Story & Art' },
  });

  await prisma.comic_Publishers.create({
    data: { comic_id: comics[1].id, publisher_id: publishers[0].id },
  });

  // Dragon Ball associations
  await prisma.comic_Genres.createMany({
    data: [
      { comic_id: comics[2].id, genre_id: genres[0].id }, // Action
      { comic_id: comics[2].id, genre_id: genres[1].id }, // Adventure
      { comic_id: comics[2].id, genre_id: genres[2].id }, // Comedy
      { comic_id: comics[2].id, genre_id: genres[4].id }, // Fantasy
    ],
  });

  await prisma.comic_Authors.create({
    data: { comic_id: comics[2].id, author_id: authors[2].id, role: 'Story & Art' },
  });

  await prisma.comic_Publishers.create({
    data: { comic_id: comics[2].id, publisher_id: publishers[0].id },
  });

  // Attack on Titan associations
  await prisma.comic_Genres.createMany({
    data: [
      { comic_id: comics[3].id, genre_id: genres[0].id }, // Action
      { comic_id: comics[3].id, genre_id: genres[3].id }, // Drama
      { comic_id: comics[3].id, genre_id: genres[4].id }, // Fantasy
      { comic_id: comics[3].id, genre_id: genres[5].id }, // Horror
    ],
  });

  await prisma.comic_Authors.create({
    data: { comic_id: comics[3].id, author_id: authors[3].id, role: 'Story & Art' },
  });

  await prisma.comic_Publishers.create({
    data: { comic_id: comics[3].id, publisher_id: publishers[1].id },
  });

  // Berserk associations
  await prisma.comic_Genres.createMany({
    data: [
      { comic_id: comics[4].id, genre_id: genres[0].id }, // Action
      { comic_id: comics[4].id, genre_id: genres[1].id }, // Adventure
      { comic_id: comics[4].id, genre_id: genres[3].id }, // Drama
      { comic_id: comics[4].id, genre_id: genres[4].id }, // Fantasy
      { comic_id: comics[4].id, genre_id: genres[5].id }, // Horror
    ],
  });

  await prisma.comic_Authors.create({
    data: { comic_id: comics[4].id, author_id: authors[4].id, role: 'Story & Art' },
  });

  await prisma.comic_Publishers.create({
    data: { comic_id: comics[4].id, publisher_id: publishers[1].id },
  });

  // Create chapters and pages for One Piece
  console.log('Creating chapters and pages for One Piece...');
  const onePieceChapters = await Promise.all([
    prisma.chapters.create({
      data: {
        comic_id: comics[0].id,
        chapter_number: 1,
        title: 'Romance Dawn',
        slug: 'chapter-1',
        release_date: new Date('2023-01-01'),
        view_count: 1000,
      },
    }),
    prisma.chapters.create({
      data: {
        comic_id: comics[0].id,
        chapter_number: 2,
        title: 'They Call Him "Straw Hat Luffy"',
        slug: 'chapter-2',
        release_date: new Date('2023-01-08'),
        view_count: 950,
      },
    }),
    prisma.chapters.create({
      data: {
        comic_id: comics[0].id,
        chapter_number: 3,
        title: 'Morgan versus Luffy',
        slug: 'chapter-3',
        release_date: new Date('2023-01-15'),
        view_count: 900,
      },
    }),
  ]);

  // Create pages for One Piece chapters
  for (let i = 0; i < onePieceChapters.length; i++) {
    const pageCount = 15; // Each chapter has 15 pages
    const pages = [];

    for (let j = 1; j <= pageCount; j++) {
      pages.push({
        chapter_id: onePieceChapters[i].id,
        page_number: j,
        image_url: `https://placehold.co/800x1200/png?text=One+Piece+Chapter+${i + 1}+Page+${j}`,
        image_alt_text: `One Piece Chapter ${i + 1} Page ${j}`,
      });
    }

    await prisma.pages.createMany({
      data: pages,
    });
  }

  // Create chapters and pages for Naruto
  console.log('Creating chapters and pages for Naruto...');
  const narutoChapters = await Promise.all([
    prisma.chapters.create({
      data: {
        comic_id: comics[1].id,
        chapter_number: 1,
        title: 'Uzumaki Naruto',
        slug: 'chapter-1',
        release_date: new Date('2023-01-02'),
        view_count: 950,
      },
    }),
    prisma.chapters.create({
      data: {
        comic_id: comics[1].id,
        chapter_number: 2,
        title: 'Konohamaru!',
        slug: 'chapter-2',
        release_date: new Date('2023-01-09'),
        view_count: 900,
      },
    }),
    prisma.chapters.create({
      data: {
        comic_id: comics[1].id,
        chapter_number: 3,
        title: 'Sasuke Uchiha',
        slug: 'chapter-3',
        release_date: new Date('2023-01-16'),
        view_count: 850,
      },
    }),
  ]);

  // Create pages for Naruto chapters
  for (let i = 0; i < narutoChapters.length; i++) {
    const pageCount = 15; // Each chapter has 15 pages
    const pages = [];

    for (let j = 1; j <= pageCount; j++) {
      pages.push({
        chapter_id: narutoChapters[i].id,
        page_number: j,
        image_url: `https://placehold.co/800x1200/png?text=Naruto+Chapter+${i + 1}+Page+${j}`,
        image_alt_text: `Naruto Chapter ${i + 1} Page ${j}`,
      });
    }

    await prisma.pages.createMany({
      data: pages,
    });
  }

  // Create chapters and pages for Attack on Titan
  console.log('Creating chapters and pages for Attack on Titan...');
  const aotChapters = await Promise.all([
    prisma.chapters.create({
      data: {
        comic_id: comics[3].id,
        chapter_number: 1,
        title: 'To You, 2000 Years From Now',
        slug: 'chapter-1',
        release_date: new Date('2023-01-03'),
        view_count: 900,
      },
    }),
    prisma.chapters.create({
      data: {
        comic_id: comics[3].id,
        chapter_number: 2,
        title: 'That Day',
        slug: 'chapter-2',
        release_date: new Date('2023-01-10'),
        view_count: 850,
      },
    }),
    prisma.chapters.create({
      data: {
        comic_id: comics[3].id,
        chapter_number: 3,
        title: 'A Dim Light Amid Despair',
        slug: 'chapter-3',
        release_date: new Date('2023-01-17'),
        view_count: 800,
      },
    }),
  ]);

  // Create pages for Attack on Titan chapters
  for (let i = 0; i < aotChapters.length; i++) {
    const pageCount = 15; // Each chapter has 15 pages
    const pages = [];

    for (let j = 1; j <= pageCount; j++) {
      pages.push({
        chapter_id: aotChapters[i].id,
        page_number: j,
        image_url: `https://placehold.co/800x1200/png?text=AoT+Chapter+${i + 1}+Page+${j}`,
        image_alt_text: `Attack on Titan Chapter ${i + 1} Page ${j}`,
      });
    }

    await prisma.pages.createMany({
      data: pages,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
