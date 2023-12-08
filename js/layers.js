addLayer("c", {
    name: "constants", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFAA00",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "constants", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('c', 12)) mult = mult.times(2.718)
        mult = mult.mul(smartUpgradeEffect('c', 22))
        mult = mult.mul(smartUpgradeEffect('c', 33))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() {
        let gen = new Decimal(0)
        gen = gen.add(smartUpgradeEffect('c', 23, 0))
        return gen
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for constants", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        "upgrades",
        "blank",
        "buyables",
        "blank",
    ],
    upgrades: {
        11: {
            title: "Circular",
            description() {return "Another collab tree... let's hope it doesn't fail this time. Multiply point gain by 3.14."},
            cost: new Decimal(1)
        },
        12: {
            title: "Natural Growth",
            description: "Multiply prestige point gain by 2.718.",
            cost: new Decimal(3)
        },
        13: {
            title: "Rabbits",
            description: "Each upgrade multiplies point gain by 1.618",
            cost: new Decimal(8),
            effect() {return new Decimal(player.c.upgrades.length).max(0).pow_base(1.618)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            tooltip: "1.618 ^ Upgrades"
        },
        21: {
            title: "Dynamic Circles",
            description: "Multiply point gain based on your constants",
            cost: new Decimal(50),
            effect() {return player.c.points.max(0).add(1).mul(3.14).root(4)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('c', 13)},
            tooltip: "4rt (πConstants)"
        },
        22: {
            title: "Natural Logs",
            description: "Multiply constant gain based on your constants",
            cost: new Decimal(500),
            effect() {return player.c.points.max(0).add(1).ln().add(1)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('c', 13)},
            tooltip: "ln (Constants)"
        },
        23: {
            title: "Rabbit Helpers",
            description: "Passively generate constants based on your upgrades",
            cost: new Decimal(10000),
            effect() {return new Decimal(player.c.upgrades.length).max(0).div(10)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id).mul(100))+"%"},
            unlocked() {return hasUpgrade('c', 13)},
            tooltip: "Upgrades / 10"
        },
        31: {
            title: "Nine Circles",
            description: "Multiply point gain by 9",
            cost: new Decimal(25000),
            unlocked() {return hasUpgrade('c', 23)}
        },
        32: {
            title: "Natural Buyables",
            description: "Unlock a buyable",
            cost: new Decimal(75000),
            unlocked() {return hasUpgrade('c', 23)}
        },
        33: {
            title: "Golden Rabbits",
            description: "Unlock a New Layer and 'Rabbits' (C 1-3) upgrade multiplies constants gain at a reduced rate",
            cost: new Decimal("1e6"),
            effect() {return upgradeEffect('c', 13).root(2)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('c', 23)},
            tooltip: "sqrt (Effect)"
        },
    },
    buyables: {
        11: {
            title() {return formatWhole(getBuyableAmount(this.layer, this.id))+"<br>Natural"},
            display() {
                return `
                Multiply point gain by 2.718
                Cost: ${format(this.cost())} constants
                Effect: x${format(buyableEffect(this.layer, this.id))} points
                `
            },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return x.pow(1.1).pow_base(3).mul(50000)
            },
            canAfford() {
                return player.c.points.gte(this.cost())
            },
            buy() {
                player.c.points = player.c.points.sub(this.cost()).max(0)
                addBuyables(this.layer, this.id, 1)
            },
            effect() {
                return getBuyableAmount(this.layer, this.id).pow_base(2.718)
            },
            unlocked() {return hasUpgrade('c', 32)},
            tooltip: "Effect Formula:<br>2.718 ^ x<br><br>Cost Formula:<br>3 ^ x ^ 1.1 * 50,000",
        },
    },
})
