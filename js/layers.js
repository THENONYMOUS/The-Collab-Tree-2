// FORMAT YOUR CODE!
addLayer("c", {
    name: "constants", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            autoPrestige: false
        };
    },
    color: "#FFAA00",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "constants", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {
        return player.points;
    }, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);

        // Constants
        if (hasUpgrade("c", 12)) mult = mult.times(2.718);
        mult = mult.mul(smartUpgradeEffect("c", 22));
        mult = mult.mul(smartUpgradeEffect("c", 33));

        // Functions
        mult = mult.mul(smartMilestoneEffect("f", 1));
        mult = mult.mul(buyableEffect("f", 11));

        return mult;
    },
    gainExp() {
        // Calculate the exponent on main currency from bonuses
        return new Decimal(1);
    },
    passiveGeneration() {
        let gen = new Decimal(0);
        gen = gen.add(smartUpgradeEffect("c", 23, 0));
        return gen;
    },
    autoPrestige() {
        return player.c.autoPrestige;
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "c",
            description: "C: Reset for constants",
            onPress() {
                if (canReset(this.layer)) doReset(this.layer);
            }
        }
    ],
    layerShown() {
        return true;
    },
    automate() {
        if (hasMilestone("f", 3)) buyBuyable("c", 11);
    },
    doReset(resettingLayer) {
        let resetRow = layers[resettingLayer].row;
        if (resetRow <= this.row) return;

        let keep = [];
        if (hasMilestone("f", 3)) keep.push("upgrades");
        layerDataReset(this.layer, keep);
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        "blank",
        ["display-text", "Auto-reset"],
        ["toggle", ["c", "autoPrestige"]],
        "blank",
        "upgrades",
        "blank",
        "buyables",
        "blank"
    ],
    upgrades: {
        11: {
            title: "Circular",
            description() {
                return "Another collab tree... let's hope it doesn't fail this time. Multiply point gain by 3.14.";
            },
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
            effect() {
                return new Decimal(player.c.upgrades.length)
                    .max(0)
                    .pow_base(1.618);
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id));
            },
            tooltip: "1.618 ^ Upgrades"
        },
        21: {
            title: "Dynamic Circles",
            description: "Multiply point gain based on your constants",
            cost: new Decimal(50),
            effect() {
                return player.c.points.max(0).add(1).mul(3.14).root(4);
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id));
            },
            unlocked() {
                return hasUpgrade("c", 13);
            },
            tooltip: "4rt (πConstants)"
        },
        22: {
            title: "Natural Logs",
            description: "Multiply constant gain based on your constants",
            cost: new Decimal(500),
            effect() {
                return player.c.points.max(0).add(1).ln().add(1);
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id));
            },
            unlocked() {
                return hasUpgrade("c", 13);
            },
            tooltip: "ln (Constants)"
        },
        23: {
            title: "Rabbit Helpers",
            description: "Passively generate constants based on your upgrades",
            cost: new Decimal(10000),
            effect() {
                return new Decimal(player.c.upgrades.length).max(0).div(10);
            },
            effectDisplay() {
                return (
                    "+" +
                    format(upgradeEffect(this.layer, this.id).mul(100)) +
                    "%"
                );
            },
            unlocked() {
                return hasUpgrade("c", 13);
            },
            tooltip: "Upgrades / 10"
        },
        31: {
            title: "Nine Circles",
            description: "Multiply point gain by 9",
            cost: new Decimal(25000),
            unlocked() {
                return hasUpgrade("c", 23);
            }
        },
        32: {
            title: "Natural Buyables",
            description: "Unlock a buyable",
            cost: new Decimal(75000),
            unlocked() {
                return hasUpgrade("c", 23);
            }
        },
        33: {
            title: "Golden Rabbits",
            description:
                "Unlock a New Layer and 'Rabbits' (C 1-3) upgrade multiplies constants gain at a reduced rate",
            cost: new Decimal("1e6"),
            effect() {
                return upgradeEffect("c", 13).root(2);
            },
            effectDisplay() {
                return "x" + format(upgradeEffect(this.layer, this.id));
            },
            unlocked() {
                return hasUpgrade("c", 23);
            },
            tooltip: "sqrt (Effect)"
        }
    },
    buyables: {
        11: {
            title() {
                return (
                    formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Natural"
                );
            },
            display() {
                return `
                Multiply point gain by 2.718
                Cost: ${format(this.cost())} constants
                Effect: x${format(buyableEffect(this.layer, this.id))} points
                `;
            },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return x.pow(1.1).pow_base(3).mul(50000);
            },
            canAfford() {
                return player.c.points.gte(this.cost());
            },
            buy() {
                if (!hasMilestone("f", 3)) {
                    player.c.points = player.c.points.sub(this.cost()).max(0);
                }
                addBuyables(this.layer, this.id, 1);
            },
            effect() {
                let x = getBuyableAmount(this.layer, this.id);
                x = x.add(buyableEffect("f", 13));
                return x.exp();
            },
            unlocked() {
                return hasUpgrade("c", 32);
            },
            tooltip:
                "Effect Formula:<br>2.718 ^ x<br><br>Cost Formula:<br>3 ^ x ^ 1.1 * 50,000"
        }
    }
});
addLayer("f", {
    name: "functions", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            loops: new Decimal(0),
            effPoints: new Decimal(0)
        };
    },
    color: "#00FFCC",
    requires: new Decimal("2.5e8"), // Can be a function that takes requirement increases into account
    resource: "functions", // Name of prestige currency
    baseResource: "constants", // Name of resource prestige is based on
    baseAmount() {
        return player.c.points;
    }, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.1, // Prestige currency exponent
    base: 10,
    gainMult() {
        // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1);
        return mult;
    },
    gainExp() {
        // Calculate the exponent on main currency from bonuses
        return new Decimal(1);
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["c"],
    hotkeys: [
        {
            key: "f",
            description: "F: Reset for functions",
            onPress() {
                if (canReset(this.layer)) doReset(this.layer);
            },
            unlocked() {
                return player[this.layer].unlocked;
            }
        }
    ],
    layerShown() {
        return hasUpgrade("c", 33) || player[this.layer].unlocked;
    },
    autoPrestige() {
        return hasMilestone("f", 4);
    },
    resetsNothing() {
        return hasMilestone("f", 4);
    },
    doReset(resettingLayer) {
        let resetRow = layers[resettingLayer].row;
        if (resetRow <= this.row) return;

        let keep = [];
        layerDataReset(this.layer, keep);
    },
    tabFormat: {
        Milestones: {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "blank",
                "milestones",
                "blank"
            ]
        },
        Loops: {
            content: [
                "main-display",
                "prestige-button",
                "resource-display",
                "blank",
                [
                    "display-text",
                    () => {
                        return (
                            "You have <h2 style='color: #00FFCC'>" +
                            formatWhole(player.f.loops) +
                            "</h2> Loops<br>Your loops increase the effective functions for effects by +" +
                            format(player.f.loops) +
                            " and unlock a buyable at each loop up to [x]"
                        );
                    }
                ],
                "blank",
                ["bar", "barA"],
                "blank",
                "buyables",
                "blank"
            ]
        }
    },
    update(diff) {
        player.f.loops = player.f.points.div(5).root(1.3).floor();
        player.f.effPoints = player.f.points.add(player.f.loops);
    },
    milestones: {
        0: {
            requirementDescription: "Function 1: e^x",
            effectDescription() {
                return (
                    "Multiply point gain by e^f<br>Currently: x" +
                    format(milestoneEffect(this.layer, this.id))
                );
            },
            done() {
                return player.f.points.gte(1);
            },
            effect() {
                return player.f.effPoints.max(0).exp();
            }
        },
        1: {
            requirementDescription: "Function 2: x^2",
            effectDescription() {
                return (
                    "Multiply constant gain by f^2<br>Currently: x" +
                    format(milestoneEffect(this.layer, this.id))
                );
            },
            done() {
                return player.f.points.gte(2);
            },
            effect() {
                return player.f.effPoints.max(1).pow(2);
            }
        },
        2: {
            requirementDescription: "Function 3: log100(x)",
            effectDescription() {
                return (
                    "Multiply point gain by log10(c)<br>Currently: x" +
                    format(milestoneEffect(this.layer, this.id))
                );
            },
            done() {
                return player.f.points.gte(3);
            },
            effect() {
                return player.c.points.max(100).log(100);
            }
        },
        3: {
            requirementDescription: "Loop 2: Retaining and Automating",
            effectDescription() {
                return "Keep all constant upgrades on reset and automatically buy 'Natural' without costing anything";
            },
            done() {
                return player.f.loops.gte(2);
            },
            unlocked() {
                return (
                    player.f.loops.gte(1) || hasMilestone(this.layer, this.id)
                );
            }
        },
        4: {
            requirementDescription: "Loop 4: Self Sustaining",
            effectDescription() {
                return "Automatically reset for functions and they reset nothing";
            },
            done() {
                return player.f.loops.gte(4);
            },
            unlocked() {
                return (
                    player.f.loops.gte(1) || hasMilestone(this.layer, this.id)
                );
            }
        },
        5: {
            requirementDescription: "Loop 5: Unlocking",
            effectDescription() {
                return "Unlock a new layer";
            },
            done() {
                return player.f.loops.gte(5);
            },
            unlocked() {
                return (
                    player.f.loops.gte(1) || hasMilestone(this.layer, this.id)
                );
            }
        }
    },
    bars: {
        barA: {
            direction: RIGHT,
            width: 400,
            height: 50,
            progress() {
                return player.f.points
                    .sub(player.f.loops.pow(1.3).mul(5).ceil())
                    .div(
                        player.f.loops
                            .add(1)
                            .pow(1.3)
                            .mul(5)
                            .ceil()
                            .sub(player.f.loops.pow(1.3).mul(5).ceil())
                    );
            },
            display() {
                return (
                    formatWhole(player.f.points) +
                    " / " +
                    formatWhole(player.f.loops.add(1).pow(1.3).mul(5).ceil()) +
                    " Functions"
                );
            },
            fillStyle() {
                return {
                    "background-color": "#FF0000"
                };
            }
        }
    },
    buyables: {
        11: {
            title() {
                return (
                    formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Loop 1"
                );
            },
            display() {
                return `
                Multiply constant gain based on Loops
                Cost: ${format(this.cost())} constants
                Effect: x${format(buyableEffect(this.layer, this.id))} constants
                `;
            },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return x.pow(1.3).pow_base(25).mul("1e15");
            },
            canAfford() {
                return player.c.points.gte(this.cost());
            },
            buy() {
                player.c.points = player.c.points.sub(this.cost()).max(0);
                addBuyables(this.layer, this.id, 1);
            },
            effect() {
                return getBuyableAmount(this.layer, this.id).pow_base(
                    player.f.loops.max(0).root(2).add(2)
                );
            },
            unlocked() {
                return (
                    player.f.loops.gte(1) ||
                    getBuyableAmount(this.layer, this.id).gte(1)
                );
            },
            tooltip:
                "Effect Formula:<br>(sqrt (loops) + 2) ^ x<br><br>Cost Formula:<br>25 ^ x ^ 131 * 1e15"
        },
        12: {
            title() {
                return (
                    formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Loop 2"
                );
            },
            display() {
                return `
                Multiply point gain based on points
                Cost: ${format(this.cost())} constants
                Effect: x${format(buyableEffect(this.layer, this.id))} points
                `;
            },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return x.pow(1.3).pow_base(25).mul("1e25");
            },
            canAfford() {
                return player.c.points.gte(this.cost());
            },
            buy() {
                player.c.points = player.c.points.sub(this.cost()).max(0);
                addBuyables(this.layer, this.id, 1);
            },
            effect() {
                return getBuyableAmount(this.layer, this.id).pow_base(
                    player.points.max(0).add(1).log(10).add(1)
                );
            },
            unlocked() {
                return (
                    player.f.loops.gte(2) ||
                    getBuyableAmount(this.layer, this.id).gte(1)
                );
            },
            tooltip:
                "Effect Formula:<br>(log10 (points) + 1) ^ x<br><br>Cost Formula:<br>25 ^ x ^ 1.3 * 1e25"
        },
        13: {
            title() {
                return (
                    formatWhole(getBuyableAmount(this.layer, this.id)) +
                    "<br>Loop 3"
                );
            },
            display() {
                return `
                Increase effective levels of 'Natural' based on loops
                Cost: ${format(this.cost())} constants
                Effect: +${format(
                    buyableEffect(this.layer, this.id)
                )} 'Natural' levels
                `;
            },
            cost(x = getBuyableAmount(this.layer, this.id)) {
                return x.pow(1.3).pow_base(25).mul("1e35");
            },
            canAfford() {
                return player.c.points.gte(this.cost());
            },
            buy() {
                player.c.points = player.c.points.sub(this.cost()).max(0);
                addBuyables(this.layer, this.id, 1);
            },
            effect() {
                return getBuyableAmount(this.layer, this.id)
                    .root(1.08)
                    .mul(player.f.loops.max(0).add(1).root(2));
            },
            unlocked() {
                return (
                    player.f.loops.gte(3) ||
                    getBuyableAmount(this.layer, this.id).gte(1)
                );
            },
            tooltip:
                "Effect Formula:<br>1.08rt(x)(sqrt (loops))<br><br>Cost Formula:<br>25 ^ x ^ 1.3 * 1e35"
        }
    }
});
