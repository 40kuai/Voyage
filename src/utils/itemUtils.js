// 物品系统工具函数

// 物品类型定义
export const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  POTION: 'potion',
  FOOD: 'food',
  MATERIAL: 'material',
  CURRENCY: 'currency',
  TREASURE: 'treasure',
  KEY: 'key'
}

// 物品稀有度定义
export const ITEM_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
}

// 获取物品类型的显示名称
export const getItemTypeName = (type) => {
  const typeNames = {
    [ITEM_TYPES.WEAPON]: '武器',
    [ITEM_TYPES.ARMOR]: '防具',
    [ITEM_TYPES.POTION]: '药水',
    [ITEM_TYPES.FOOD]: '食物',
    [ITEM_TYPES.MATERIAL]: '材料',
    [ITEM_TYPES.CURRENCY]: '货币',
    [ITEM_TYPES.TREASURE]: '宝藏',
    [ITEM_TYPES.KEY]: '钥匙'
  }
  return typeNames[type] || '物品'
}

// 获取物品稀有度的显示名称
export const getItemRarityName = (rarity) => {
  const rarityNames = {
    [ITEM_RARITIES.COMMON]: '普通',
    [ITEM_RARITIES.UNCOMMON]: '优秀',
    [ITEM_RARITIES.RARE]: '稀有',
    [ITEM_RARITIES.EPIC]: '史诗',
    [ITEM_RARITIES.LEGENDARY]: '传说'
  }
  return rarityNames[rarity] || '普通'
}

// 获取物品类型的图标
export const getItemIcon = (type) => {
  const icons = {
    [ITEM_TYPES.WEAPON]: '⚔️',
    [ITEM_TYPES.ARMOR]: '🛡️',
    [ITEM_TYPES.POTION]: '🧪',
    [ITEM_TYPES.FOOD]: '🍎',
    [ITEM_TYPES.MATERIAL]: '🧱',
    [ITEM_TYPES.CURRENCY]: '💰',
    [ITEM_TYPES.TREASURE]: '💎',
    [ITEM_TYPES.KEY]: '🗝️'
  }
  return icons[type] || '📦'
}

// 获取物品稀有度的颜色
export const getItemRarityColor = (rarity) => {
  const rarityColors = {
    [ITEM_RARITIES.COMMON]: '#999999',
    [ITEM_RARITIES.UNCOMMON]: '#1eff00',
    [ITEM_RARITIES.RARE]: '#0070dd',
    [ITEM_RARITIES.EPIC]: '#a335ee',
    [ITEM_RARITIES.LEGENDARY]: '#ff8000'
  }
  return rarityColors[rarity] || '#999999'
}

// 检查物品是否可以使用
export const canUseItem = (item) => {
  return [ITEM_TYPES.POTION, ITEM_TYPES.FOOD].includes(item.type)
}

// 使用物品的效果处理
export const useItemEffect = (item, player) => {
  const effects = item.effects || {}
  const result = { used: false, message: '' }
  
  if (effects.health) {
    player.health = Math.min(player.health + effects.health, 100)
    result.used = true
    result.message = `使用了${item.name}，恢复了${effects.health}点生命值`
  }
  
  if (effects.mana) {
    player.mana = Math.min(player.mana + effects.mana, 50)
    result.used = true
    result.message = `使用了${item.name}，恢复了${effects.mana}点法力值`
  }
  
  if (effects.strength) {
    player.strength += effects.strength
    result.used = true
    result.message = `使用了${item.name}，力量增加了${effects.strength}点`
  }
  
  if (effects.agility) {
    player.agility += effects.agility
    result.used = true
    result.message = `使用了${item.name}，敏捷增加了${effects.agility}点`
  }
  
  if (effects.intelligence) {
    player.intelligence += effects.intelligence
    result.used = true
    result.message = `使用了${item.name}，智力增加了${effects.intelligence}点`
  }
  
  return result
}

// 生成随机物品
export const generateRandomItem = (level = 1) => {
  const itemTypes = Object.values(ITEM_TYPES)
  const itemRarities = Object.values(ITEM_RARITIES)
  
  const type = itemTypes[Math.floor(Math.random() * itemTypes.length)]
  const rarity = itemRarities[Math.floor(Math.random() * itemRarities.length)]
  
  // 根据类型和稀有度生成物品属性
  let name, description, value, effects
  
  switch (type) {
    case ITEM_TYPES.WEAPON:
      name = getRandomWeaponName()
      description = `一把${getItemRarityName(rarity)}的武器，攻击力较高。`
      value = Math.floor(level * 10 * (1 + getRarityMultiplier(rarity)))
      break
    
    case ITEM_TYPES.ARMOR:
      name = getRandomArmorName()
      description = `一件${getItemRarityName(rarity)}的防具，防御力较高。`
      value = Math.floor(level * 8 * (1 + getRarityMultiplier(rarity)))
      break
    
    case ITEM_TYPES.POTION:
      name = getRandomPotionName()
      description = `一瓶${getItemRarityName(rarity)}的药水，可以恢复生命值。`
      value = Math.floor(level * 5 * (1 + getRarityMultiplier(rarity)))
      effects = {
        health: Math.floor(20 * (1 + getRarityMultiplier(rarity)))
      }
      break
    
    case ITEM_TYPES.FOOD:
      name = getRandomFoodName()
      description = `一份${getItemRarityName(rarity)}的食物，可以恢复少量生命值。`
      value = Math.floor(level * 3 * (1 + getRarityMultiplier(rarity)))
      effects = {
        health: Math.floor(10 * (1 + getRarityMultiplier(rarity)))
      }
      break
    
    case ITEM_TYPES.MATERIAL:
      name = getRandomMaterialName()
      description = `一份${getItemRarityName(rarity)}的材料，可以用来制作物品。`
      value = Math.floor(level * 2 * (1 + getRarityMultiplier(rarity)))
      break
    
    case ITEM_TYPES.CURRENCY:
      name = '金币'
      description = `可以用来购买物品的货币。`
      value = Math.floor(level * 1 * (1 + getRarityMultiplier(rarity)))
      break
    
    case ITEM_TYPES.TREASURE:
      name = getRandomTreasureName()
      description = `一件${getItemRarityName(rarity)}的宝藏，价值连城。`
      value = Math.floor(level * 20 * (1 + getRarityMultiplier(rarity)))
      break
    
    case ITEM_TYPES.KEY:
      name = getRandomKeyName()
      description = `一把${getItemRarityName(rarity)}的钥匙，可以打开特定的门或宝箱。`
      value = Math.floor(level * 1 * (1 + getRarityMultiplier(rarity)))
      break
  }
  
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name,
    description,
    type,
    rarity,
    value,
    effects
  }
}

// 随机武器名称生成
const getRandomWeaponName = () => {
  const prefixes = ['锋利的', '坚固的', '神秘的', '古老的', '传奇的']
  const weaponNames = ['剑', '斧头', '锤子', '长矛', '匕首']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const weapon = weaponNames[Math.floor(Math.random() * weaponNames.length)]
  return `${prefix}${weapon}`
}

// 随机防具名称生成
const getRandomArmorName = () => {
  const prefixes = ['坚韧的', '轻便的', '华丽的', '防护的', '魔法的']
  const armorNames = ['头盔', '胸甲', '护腿', '手套', '靴子']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const armor = armorNames[Math.floor(Math.random() * armorNames.length)]
  return `${prefix}${armor}`
}

// 随机药水名称生成
const getRandomPotionName = () => {
  const prefixes = ['红色', '蓝色', '绿色', '紫色', '金色']
  const potionNames = ['治疗药水', '法力药水', '力量药水', '敏捷药水', '智力药水']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const potion = potionNames[Math.floor(Math.random() * potionNames.length)]
  return `${prefix}${potion}`
}

// 随机食物名称生成
const getRandomFoodName = () => {
  const foodNames = ['苹果', '面包', '烤肉', '奶酪', '蜂蜜']
  return foodNames[Math.floor(Math.random() * foodNames.length)]
}

// 随机材料名称生成
const getRandomMaterialName = () => {
  const materialNames = ['木材', '石头', '铁矿石', '铜矿石', '布料']
  return materialNames[Math.floor(Math.random() * materialNames.length)]
}

// 随机宝藏名称生成
const getRandomTreasureName = () => {
  const treasureNames = ['钻石', '红宝石', '蓝宝石', '绿宝石', '珍珠']
  return treasureNames[Math.floor(Math.random() * treasureNames.length)]
}

// 随机钥匙名称生成
const getRandomKeyName = () => {
  const keyNames = ['铁钥匙', '铜钥匙', '银钥匙', '金钥匙', '魔法钥匙']
  return keyNames[Math.floor(Math.random() * keyNames.length)]
}

// 获取稀有度的倍数
const getRarityMultiplier = (rarity) => {
  const multipliers = {
    [ITEM_RARITIES.COMMON]: 0,
    [ITEM_RARITIES.UNCOMMON]: 0.2,
    [ITEM_RARITIES.RARE]: 0.5,
    [ITEM_RARITIES.EPIC]: 1.0,
    [ITEM_RARITIES.LEGENDARY]: 2.0
  }
  return multipliers[rarity] || 0
}

// 物品比较函数
export const compareItems = (a, b) => {
  // 首先按稀有度排序
  const rarityOrder = Object.values(ITEM_RARITIES)
  const rarityCompare = rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
  if (rarityCompare !== 0) {
    return rarityCompare
  }
  
  // 然后按类型排序
  const typeOrder = Object.values(ITEM_TYPES)
  const typeCompare = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
  if (typeCompare !== 0) {
    return typeCompare
  }
  
  // 最后按价值排序
  return b.value - a.value
}

// 过滤物品列表
export const filterItems = (items, filters) => {
  return items.filter(item => {
    if (filters.type && item.type !== filters.type) {
      return false
    }
    if (filters.rarity && item.rarity !== filters.rarity) {
      return false
    }
    if (filters.minValue && item.value < filters.minValue) {
      return false
    }
    if (filters.maxValue && item.value > filters.maxValue) {
      return false
    }
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  })
}
