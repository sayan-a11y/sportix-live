const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Add a sample Ad
  const ad = await prisma.ad.create({
    data: {
      type: 'banner',
      url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200&h=200',
      redirectLink: 'https://sportixlive.com/premium',
      active: true,
    }
  })
  console.log('Sample Ad created:', ad)

  // Add sample reactions for a stream if one exists
  const stream = await prisma.stream.findFirst()
  if (stream) {
    await prisma.reaction.createMany({
      data: [
        { streamId: stream.id, type: 'like' },
        { streamId: stream.id, type: 'heart' },
        { streamId: stream.id, type: 'fire' },
      ]
    })
    console.log('Sample reactions added to stream:', stream.title)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
