"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const heroes = [
    {
        name: 'Layla',
        slug: 'layla',
        description: 'A young girl with a powerful cannon, Layla is a marksman who excels at dealing damage from a distance.',
        role: 'MARKSMAN',
        difficulty: 1,
        health: 2500,
        mana: 450,
        physicalAttack: 120,
        physicalDefense: 15,
        magicPower: 0,
        magicResistance: 10,
        speed: 240,
        attackSpeed: 0.85,
        abilities: [
            {
                name: 'Malefic Gun',
                description: 'Layla\'s basic attacks deal extra damage and have increased range.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Void Projectile',
                description: 'Fires a projectile that deals physical damage to enemies in a line.',
                cooldown: 5,
                manaCost: 80,
                damage: '200 / 250 / 300 / 350 / 400',
                type: 'Active',
                level: 1
            },
            {
                name: 'Destruction Rush',
                description: 'Layla dashes forward and gains increased attack speed.',
                cooldown: 8,
                manaCost: 100,
                type: 'Active',
                level: 1
            },
            {
                name: 'Malefic Bomb',
                description: 'Fires a powerful bomb that deals massive damage in a large area.',
                cooldown: 30,
                manaCost: 150,
                damage: '500 / 600 / 700',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Miya',
        slug: 'miya',
        description: 'An elf archer with incredible accuracy and speed, Miya is perfect for players who love to kite enemies.',
        role: 'MARKSMAN',
        difficulty: 2,
        health: 2400,
        mana: 420,
        physicalAttack: 115,
        physicalDefense: 12,
        magicPower: 0,
        magicResistance: 8,
        speed: 250,
        attackSpeed: 0.9,
        abilities: [
            {
                name: 'Frost Arrow',
                description: 'Miya\'s basic attacks slow enemies and deal bonus damage.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Arrow of Eclipse',
                description: 'Fires multiple arrows that deal physical damage to all enemies in a cone.',
                cooldown: 6,
                manaCost: 70,
                damage: '180 / 220 / 260 / 300 / 340',
                type: 'Active',
                level: 1
            },
            {
                name: 'Twin Blades',
                description: 'Miya gains increased attack speed and critical chance.',
                cooldown: 10,
                manaCost: 90,
                type: 'Active',
                level: 1
            },
            {
                name: 'Hidden Moonlight',
                description: 'Miya becomes invisible and gains increased movement speed and attack speed.',
                cooldown: 25,
                manaCost: 120,
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Alucard',
        slug: 'alucard',
        description: 'A vampire fighter with life steal abilities, Alucard excels at sustained combat and healing.',
        role: 'FIGHTER',
        difficulty: 3,
        health: 2800,
        mana: 400,
        physicalAttack: 130,
        physicalDefense: 25,
        magicPower: 0,
        magicResistance: 15,
        speed: 260,
        attackSpeed: 0.8,
        abilities: [
            {
                name: 'Pursuit',
                description: 'Alucard\'s basic attacks reduce enemy armor and heal him.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Groundsplitter',
                description: 'Alucard slams the ground, dealing physical damage and stunning enemies.',
                cooldown: 7,
                manaCost: 80,
                damage: '220 / 270 / 320 / 370 / 420',
                type: 'Active',
                level: 1
            },
            {
                name: 'Whirling Smash',
                description: 'Alucard spins around, dealing damage to nearby enemies and healing himself.',
                cooldown: 9,
                manaCost: 100,
                damage: '180 / 220 / 260 / 300 / 340',
                type: 'Active',
                level: 1
            },
            {
                name: 'Fission Wave',
                description: 'Alucard releases a wave of energy that deals massive damage and heals him.',
                cooldown: 35,
                manaCost: 150,
                damage: '600 / 750 / 900',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Eudora',
        slug: 'eudora',
        description: 'A powerful mage who controls lightning, Eudora can burst down enemies with her magical abilities.',
        role: 'MAGE',
        difficulty: 2,
        health: 2200,
        mana: 600,
        physicalAttack: 50,
        physicalDefense: 8,
        magicPower: 120,
        magicResistance: 20,
        speed: 240,
        attackSpeed: 0.6,
        abilities: [
            {
                name: 'Superconductor',
                description: 'Eudora\'s abilities can chain to nearby enemies, dealing additional damage.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Forked Lightning',
                description: 'Fires a bolt of lightning that bounces between enemies.',
                cooldown: 4,
                manaCost: 90,
                damage: '300 / 360 / 420 / 480 / 540',
                type: 'Active',
                level: 1
            },
            {
                name: 'Electric Arrow',
                description: 'Fires an electric arrow that stuns the first enemy hit.',
                cooldown: 8,
                manaCost: 110,
                damage: '250 / 300 / 350 / 400 / 450',
                type: 'Active',
                level: 1
            },
            {
                name: 'Thunderstruck',
                description: 'Calls down a massive lightning bolt that deals huge damage in a large area.',
                cooldown: 40,
                manaCost: 200,
                damage: '800 / 1000 / 1200',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Tigreal',
        slug: 'tigreal',
        description: 'A noble tank who protects his allies with his shield and crowd control abilities.',
        role: 'TANK',
        difficulty: 2,
        health: 3500,
        mana: 450,
        physicalAttack: 80,
        physicalDefense: 40,
        magicPower: 0,
        magicResistance: 25,
        speed: 220,
        attackSpeed: 0.7,
        abilities: [
            {
                name: 'Fearless',
                description: 'Tigreal gains damage reduction and crowd control immunity after using abilities.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Attack Wave',
                description: 'Tigreal slams his sword, dealing physical damage and slowing enemies.',
                cooldown: 6,
                manaCost: 70,
                damage: '200 / 240 / 280 / 320 / 360',
                type: 'Active',
                level: 1
            },
            {
                name: 'Sacred Hammer',
                description: 'Tigreal charges forward, dealing damage and knocking back enemies.',
                cooldown: 10,
                manaCost: 90,
                damage: '250 / 300 / 350 / 400 / 450',
                type: 'Active',
                level: 1
            },
            {
                name: 'Implosion',
                description: 'Tigreal creates a massive explosion that stuns all enemies in a large area.',
                cooldown: 45,
                manaCost: 150,
                damage: '500 / 650 / 800',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Saber',
        slug: 'saber',
        description: 'A swift assassin who can quickly eliminate enemies with his blade skills.',
        role: 'ASSASSIN',
        difficulty: 4,
        health: 2600,
        mana: 380,
        physicalAttack: 140,
        physicalDefense: 18,
        magicPower: 0,
        magicResistance: 12,
        speed: 270,
        attackSpeed: 0.85,
        abilities: [
            {
                name: 'Enemy\'s Bane',
                description: 'Saber\'s basic attacks reduce enemy armor and deal bonus damage to low health enemies.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Charge',
                description: 'Saber dashes to an enemy, dealing physical damage and reducing their armor.',
                cooldown: 5,
                manaCost: 60,
                damage: '180 / 220 / 260 / 300 / 340',
                type: 'Active',
                level: 1
            },
            {
                name: 'Triple Sweep',
                description: 'Saber performs three quick slashes, dealing physical damage to nearby enemies.',
                cooldown: 8,
                manaCost: 80,
                damage: '200 / 240 / 280 / 320 / 360',
                type: 'Active',
                level: 1
            },
            {
                name: 'Triple Sweep',
                description: 'Saber becomes untargetable and strikes all enemies in a large area multiple times.',
                cooldown: 30,
                manaCost: 120,
                damage: '400 / 500 / 600',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Rafaela',
        slug: 'rafaela',
        description: 'A healing support who keeps her allies alive with her divine powers.',
        role: 'SUPPORT',
        difficulty: 1,
        health: 2400,
        mana: 550,
        physicalAttack: 60,
        physicalDefense: 15,
        magicPower: 100,
        magicResistance: 20,
        speed: 250,
        attackSpeed: 0.75,
        abilities: [
            {
                name: 'Divine Healing',
                description: 'Rafaela\'s abilities heal nearby allies and deal damage to enemies.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Light of Retribution',
                description: 'Fires a beam of light that heals allies and damages enemies.',
                cooldown: 4,
                manaCost: 70,
                damage: '200 / 240 / 280 / 320 / 360',
                type: 'Active',
                level: 1
            },
            {
                name: 'Holy Baptism',
                description: 'Rafaela heals herself and nearby allies, removing negative effects.',
                cooldown: 6,
                manaCost: 90,
                damage: '150 / 180 / 210 / 240 / 270',
                type: 'Active',
                level: 1
            },
            {
                name: 'Holy Healing',
                description: 'Rafaela creates a healing zone that continuously heals allies and damages enemies.',
                cooldown: 25,
                manaCost: 120,
                damage: '300 / 400 / 500',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Franco',
        slug: 'franco',
        description: 'A brutal tank who hooks enemies and controls the battlefield with his massive axe.',
        role: 'TANK',
        difficulty: 3,
        health: 3200,
        mana: 400,
        physicalAttack: 90,
        physicalDefense: 35,
        magicPower: 0,
        magicResistance: 20,
        speed: 230,
        attackSpeed: 0.75,
        abilities: [
            {
                name: 'Wasteland Force',
                description: 'Franco\'s basic attacks reduce enemy movement speed and deal bonus damage.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Iron Hook',
                description: 'Franco throws a hook that pulls the first enemy hit towards him.',
                cooldown: 12,
                manaCost: 100,
                damage: '250 / 300 / 350 / 400 / 450',
                type: 'Active',
                level: 1
            },
            {
                name: 'Fury Shock',
                description: 'Franco slams the ground, dealing damage and stunning nearby enemies.',
                cooldown: 8,
                manaCost: 80,
                damage: '200 / 240 / 280 / 320 / 360',
                type: 'Active',
                level: 1
            },
            {
                name: 'Bloody Hunt',
                description: 'Franco suppresses an enemy, dealing continuous damage and preventing them from acting.',
                cooldown: 40,
                manaCost: 150,
                damage: '400 / 500 / 600',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Balmond',
        slug: 'balmond',
        description: 'A berserker fighter who gains power as he takes damage and can heal by dealing damage.',
        role: 'FIGHTER',
        difficulty: 2,
        health: 3000,
        mana: 350,
        physicalAttack: 125,
        physicalDefense: 30,
        magicPower: 0,
        magicResistance: 18,
        speed: 250,
        attackSpeed: 0.8,
        abilities: [
            {
                name: 'Bloodthirst',
                description: 'Balmond heals when dealing damage and gains attack speed when low on health.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Soul Lock',
                description: 'Balmond charges forward, dealing damage and slowing enemies.',
                cooldown: 7,
                manaCost: 70,
                damage: '220 / 270 / 320 / 370 / 420',
                type: 'Active',
                level: 1
            },
            {
                name: 'Cyclone Sweep',
                description: 'Balmond spins around, dealing damage to nearby enemies and healing himself.',
                cooldown: 10,
                manaCost: 90,
                damage: '180 / 220 / 260 / 300 / 340',
                type: 'Active',
                level: 1
            },
            {
                name: 'Lethal Counter',
                description: 'Balmond gains massive attack damage and lifesteal for a short time.',
                cooldown: 30,
                manaCost: 120,
                damage: '300 / 400 / 500',
                type: 'Ultimate',
                level: 1
            }
        ]
    },
    {
        name: 'Nana',
        slug: 'nana',
        description: 'A mischievous mage who transforms enemies into cute creatures and controls the battlefield.',
        role: 'SUPPORT',
        difficulty: 3,
        health: 2300,
        mana: 500,
        physicalAttack: 55,
        physicalDefense: 12,
        magicPower: 110,
        magicResistance: 22,
        speed: 245,
        attackSpeed: 0.7,
        abilities: [
            {
                name: 'Molina\'s Gift',
                description: 'Nana\'s abilities can transform enemies into Molina, reducing their damage and movement speed.',
                type: 'Passive',
                level: 1
            },
            {
                name: 'Molina Blop',
                description: 'Nana throws Molina at enemies, dealing magic damage and potentially transforming them.',
                cooldown: 5,
                manaCost: 80,
                damage: '250 / 300 / 350 / 400 / 450',
                type: 'Active',
                level: 1
            },
            {
                name: 'Morph Spell',
                description: 'Nana transforms an enemy into Molina, preventing them from using abilities.',
                cooldown: 12,
                manaCost: 100,
                damage: '200 / 240 / 280 / 320 / 360',
                type: 'Active',
                level: 1
            },
            {
                name: 'Molina Smooch',
                description: 'Nana creates a large area that continuously damages enemies and transforms them.',
                cooldown: 35,
                manaCost: 150,
                damage: '400 / 500 / 600',
                type: 'Ultimate',
                level: 1
            }
        ]
    }
];
const tags = [
    { name: 'Beginner Friendly', slug: 'beginner-friendly', color: '#4CAF50' },
    { name: 'High Damage', slug: 'high-damage', color: '#F44336' },
    { name: 'Tank', slug: 'tank', color: '#2196F3' },
    { name: 'Support', slug: 'support', color: '#9C27B0' },
    { name: 'Assassin', slug: 'assassin', color: '#FF9800' },
    { name: 'Mage', slug: 'mage', color: '#E91E63' },
    { name: 'Marksman', slug: 'marksman', color: '#00BCD4' },
    { name: 'Fighter', slug: 'fighter', color: '#795548' },
    { name: 'Crowd Control', slug: 'crowd-control', color: '#607D8B' },
    { name: 'Healing', slug: 'healing', color: '#8BC34A' },
    { name: 'Mobility', slug: 'mobility', color: '#FFC107' },
    { name: 'Burst Damage', slug: 'burst-damage', color: '#FF5722' }
];
async function main() {
    console.log('Starting seed...');
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mobilelegends.com' },
        update: {},
        create: {
            email: 'admin@mobilelegends.com',
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true
        }
    });
    const testUser = await prisma.user.upsert({
        where: { email: 'test@mobilelegends.com' },
        update: {},
        create: {
            email: 'test@mobilelegends.com',
            username: 'testuser',
            password: hashedPassword,
            role: 'USER',
            isActive: true
        }
    });
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag
        });
    }
    for (const heroData of heroes) {
        const { abilities, ...heroInfo } = heroData;
        const hero = await prisma.hero.upsert({
            where: { name: heroInfo.name },
            update: {},
            create: heroInfo
        });
        for (const ability of abilities) {
            await prisma.heroAbility.upsert({
                where: {
                    heroId_name: {
                        heroId: hero.id,
                        name: ability.name
                    }
                },
                update: {},
                create: {
                    heroId: hero.id,
                    ...ability
                }
            });
        }
        const heroTags = [];
        if (heroInfo.role === 'TANK') {
            heroTags.push('Tank', 'Crowd Control');
        }
        else if (heroInfo.role === 'SUPPORT') {
            heroTags.push('Support', 'Healing');
        }
        else if (heroInfo.role === 'ASSASSIN') {
            heroTags.push('Assassin', 'Mobility', 'Burst Damage');
        }
        else if (heroInfo.role === 'MAGE') {
            heroTags.push('Mage', 'Burst Damage');
        }
        else if (heroInfo.role === 'MARKSMAN') {
            heroTags.push('Marksman', 'High Damage');
        }
        else if (heroInfo.role === 'FIGHTER') {
            heroTags.push('Fighter', 'High Damage');
        }
        if (heroInfo.difficulty <= 2) {
            heroTags.push('Beginner Friendly');
        }
        for (const tagName of heroTags) {
            const tag = await prisma.tag.findUnique({
                where: { name: tagName }
            });
            if (tag) {
                await prisma.heroTag.upsert({
                    where: {
                        heroId_tagId: {
                            heroId: hero.id,
                            tagId: tag.id
                        }
                    },
                    update: {},
                    create: {
                        heroId: hero.id,
                        tagId: tag.id
                    }
                });
            }
        }
    }
    const samplePosts = [
        {
            title: 'Welcome to Mobile Legends Fan Community!',
            content: 'Welcome to our amazing community! Here you can share your experiences, strategies, and connect with other Mobile Legends players. Whether you\'re a beginner or a pro, there\'s something for everyone here!',
            category: 'NEWS',
            authorId: admin.id
        },
        {
            title: 'Layla Guide for Beginners',
            content: 'Layla is one of the best heroes for beginners. Her long range and simple abilities make her easy to learn. Focus on farming early game and positioning in team fights. Build attack damage and attack speed items.',
            category: 'GUIDES',
            authorId: testUser.id,
            heroId: (await prisma.hero.findUnique({ where: { name: 'Layla' } }))?.id
        },
        {
            title: 'Best Tank Heroes for Ranked',
            content: 'Tigreal and Franco are currently the best tank heroes for ranked matches. They provide excellent crowd control and can initiate team fights effectively. Make sure to build tank items and focus on protecting your carries.',
            category: 'GUIDES',
            authorId: testUser.id
        },
        {
            title: 'New Hero Release: Check out the latest updates!',
            content: 'The latest hero has been released with amazing abilities! Check out the patch notes for all the details about the new character and balance changes.',
            category: 'NEWS',
            authorId: admin.id
        }
    ];
    for (const postData of samplePosts) {
        await prisma.post.create({
            data: postData
        });
    }
    console.log('Seed completed successfully!');
    console.log(`Created ${heroes.length} heroes`);
    console.log(`Created ${tags.length} tags`);
    console.log(`Created ${samplePosts.length} sample posts`);
    console.log('Admin user: admin@mobilelegends.com / admin123');
    console.log('Test user: test@mobilelegends.com / admin123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map