// 任务和成就系统工具函数

// 任务状态定义
export const QUEST_STATUS = {
  AVAILABLE: 'available',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  TURNED_IN: 'turned_in'
}

// 任务类型定义
export const QUEST_TYPES = {
  KILL: 'kill',
  COLLECT: 'collect',
  TALK: 'talk',
  EXPLORE: 'explore'
}

// 成就稀有度定义
export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
}

// 获取任务状态的显示名称
export const getQuestStatusName = (status) => {
  const statusNames = {
    [QUEST_STATUS.AVAILABLE]: '可接受',
    [QUEST_STATUS.ACCEPTED]: '进行中',
    [QUEST_STATUS.COMPLETED]: '已完成',
    [QUEST_STATUS.TURNED_IN]: '已提交'
  }
  return statusNames[status] || '未知'
}

// 获取任务类型的显示名称
export const getQuestTypeName = (type) => {
  const typeNames = {
    [QUEST_TYPES.KILL]: '击杀',
    [QUEST_TYPES.COLLECT]: '收集',
    [QUEST_TYPES.TALK]: '交谈',
    [QUEST_TYPES.EXPLORE]: '探索'
  }
  return typeNames[type] || '未知'
}

// 获取成就稀有度的显示名称
export const getAchievementRarityName = (rarity) => {
  const rarityNames = {
    [ACHIEVEMENT_RARITY.COMMON]: '普通',
    [ACHIEVEMENT_RARITY.UNCOMMON]: '优秀',
    [ACHIEVEMENT_RARITY.RARE]: '稀有',
    [ACHIEVEMENT_RARITY.EPIC]: '史诗',
    [ACHIEVEMENT_RARITY.LEGENDARY]: '传说'
  }
  return rarityNames[rarity] || '普通'
}

// 获取成就稀有度的颜色
export const getAchievementRarityColor = (rarity) => {
  const rarityColors = {
    [ACHIEVEMENT_RARITY.COMMON]: '#999999',
    [ACHIEVEMENT_RARITY.UNCOMMON]: '#1eff00',
    [ACHIEVEMENT_RARITY.RARE]: '#0070dd',
    [ACHIEVEMENT_RARITY.EPIC]: '#a335ee',
    [ACHIEVEMENT_RARITY.LEGENDARY]: '#ff8000'
  }
  return rarityColors[rarity] || '#999999'
}

// 检查任务是否可以接受
export const canAcceptQuest = (quest) => {
  return quest.status === QUEST_STATUS.AVAILABLE
}

// 检查任务是否可以提交
export const canTurnInQuest = (quest) => {
  return quest.status === QUEST_STATUS.COMPLETED
}

// 检查任务是否已完成
export const isQuestCompleted = (quest) => {
  return quest.status === QUEST_STATUS.COMPLETED || quest.status === QUEST_STATUS.TURNED_IN
}

// 检查任务目标是否已完成
export const checkQuestObjectives = (quest, playerProgress) => {
  const objectives = quest.objectives || []
  
  // 检查所有目标是否都已完成
  const allCompleted = objectives.every(objective => {
    const progress = playerProgress[objective.id] || 0
    return progress >= objective.required
  })
  
  return allCompleted
}

// 更新任务目标进度
export const updateQuestProgress = (quest, objectiveId, progress) => {
  const objective = quest.objectives.find(obj => obj.id === objectiveId)
  if (!objective) return quest
  
  // 更新目标进度
  objective.current = Math.min(progress, objective.required)
  
  // 检查任务是否已完成
  const allCompleted = quest.objectives.every(obj => obj.current >= obj.required)
  if (allCompleted && quest.status === QUEST_STATUS.ACCEPTED) {
    quest.status = QUEST_STATUS.COMPLETED
  }
  
  return quest
}

// 计算任务奖励
export const calculateQuestRewards = (quest) => {
  const rewards = {
    experience: 0,
    gold: 0,
    items: []
  }
  
  if (quest.rewards) {
    if (quest.rewards.experience) {
      rewards.experience = quest.rewards.experience
    }
    if (quest.rewards.gold) {
      rewards.gold = quest.rewards.gold
    }
    if (quest.rewards.items) {
      rewards.items = quest.rewards.items
    }
  }
  
  return rewards
}

// 检查成就是否已解锁
export const isAchievementUnlocked = (achievement, playerProgress) => {
  const requirement = achievement.requirement
  if (!requirement) return false
  
  switch (requirement.type) {
    case 'level':
      return playerProgress.level >= requirement.value
    case 'quests_completed':
      return playerProgress.questsCompleted >= requirement.value
    case 'enemies_killed':
      return playerProgress.enemiesKilled >= requirement.value
    case 'items_collected':
      return playerProgress.itemsCollected >= requirement.value
    case 'scenes_visited':
      return playerProgress.scenesVisited.length >= requirement.value
    default:
      return false
  }
}

// 获取任务进度百分比
export const getQuestProgressPercentage = (quest) => {
  const objectives = quest.objectives || []
  if (objectives.length === 0) return 0
  
  const totalRequired = objectives.reduce((sum, obj) => sum + obj.required, 0)
  const totalCurrent = objectives.reduce((sum, obj) => sum + (obj.current || 0), 0)
  
  return Math.min(Math.floor((totalCurrent / totalRequired) * 100), 100)
}

// 排序任务列表
export const sortQuests = (quests) => {
  const statusOrder = [QUEST_STATUS.COMPLETED, QUEST_STATUS.ACCEPTED, QUEST_STATUS.AVAILABLE, QUEST_STATUS.TURNED_IN]
  
  return quests.sort((a, b) => {
    // 首先按状态排序
    const statusCompare = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    if (statusCompare !== 0) {
      return statusCompare
    }
    
    // 然后按等级排序
    return (a.level || 0) - (b.level || 0)
  })
}

// 排序成就列表
export const sortAchievements = (achievements) => {
  const rarityOrder = Object.values(ACHIEVEMENT_RARITY)
  
  return achievements.sort((a, b) => {
    // 首先按是否解锁排序
    const unlockedCompare = (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0)
    if (unlockedCompare !== 0) {
      return unlockedCompare
    }
    
    // 然后按稀有度排序
    const rarityCompare = rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
    if (rarityCompare !== 0) {
      return rarityCompare
    }
    
    // 最后按ID排序
    return a.id - b.id
  })
}

// 过滤任务列表
export const filterQuests = (quests, filters) => {
  return quests.filter(quest => {
    if (filters.status && quest.status !== filters.status) {
      return false
    }
    if (filters.type && quest.type !== filters.type) {
      return false
    }
    if (filters.minLevel && (quest.level || 0) < filters.minLevel) {
      return false
    }
    if (filters.maxLevel && (quest.level || 0) > filters.maxLevel) {
      return false
    }
    return true
  })
}

// 过滤成就列表
export const filterAchievements = (achievements, filters) => {
  return achievements.filter(achievement => {
    if (filters.rarity && achievement.rarity !== filters.rarity) {
      return false
    }
    if (filters.unlocked !== undefined && achievement.unlocked !== filters.unlocked) {
      return false
    }
    return true
  })
}
