<template>
  <div class="scene-view">
    <div class="scene-header">
      <h2>{{ sceneName }}</h2>
      <div class="player-status">
        <div class="status-item">
          <span>生命值: {{ player.health }}/100</span>
          <div class="progress-bar">
            <div class="progress-fill health" :style="{ width: player.health + '%' }"></div>
          </div>
        </div>
        <div class="status-item">
          <span>法力值: {{ player.mana }}/50</span>
          <div class="progress-bar">
            <div class="progress-fill mana" :style="{ width: (player.mana / 50) * 100 + '%' }"></div>
          </div>
        </div>
        <div class="status-item">
          <span>等级: {{ player.level }}</span>
        </div>
        <div class="status-item">
          <span>经验值: {{ player.experience }}/{{ player.level * 100 }}</span>
        </div>
      </div>
    </div>
    
    <div class="scene-content">
      <div class="scene-description">
        {{ sceneDescription }}
      </div>
      
      <div class="scene-actions">
        <h3>可用操作:</h3>
        <div class="action-buttons">
          <button v-for="(exit, direction) in sceneExits" :key="direction" @click="goToScene(exit)">
            前往 {{ direction }}
          </button>
        </div>
      </div>
      
      <div class="scene-entities" v-if="sceneNPCs.length > 0">
        <h3>场景中的人物:</h3>
        <ul class="entity-list">
          <li v-for="npc in sceneNPCs" :key="npc.id">
            {{ npc.name }} - {{ npc.description }}
            <button @click="talkToNPC(npc)">交谈</button>
          </li>
        </ul>
      </div>
      
      <div class="scene-items" v-if="sceneItems.length > 0">
        <h3>场景中的物品:</h3>
        <ul class="item-list">
          <li v-for="item in sceneItems" :key="item.id">
            {{ item.name }} - {{ item.description }}
            <button @click="pickUpItem(item)">拾取</button>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="scene-footer">
      <button @click="openInventory">打开背包</button>
      <button @click="openMap">打开地图</button>
      <button @click="openQuestLog">任务日志</button>
      <button @click="openAchievements">成就</button>
      <button @click="pauseGame">暂停游戏</button>
    </div>
    
    <Inventory v-if="showInventory" @close="closeInventory" />
    <Map v-if="showMap" @close="closeMap" @scene-change="goToScene" />
    <Battle v-if="showBattle" :enemy="currentEnemy" @close="closeBattle" @battle-result="handleBattleResult" />
    <QuestLog v-if="showQuestLog" :quests="quests" @close="closeQuestLog" @accept-quest="acceptQuest" @turn-in-quest="turnInQuest" />
    <Achievements v-if="showAchievements" :achievements="achievements" @close="closeAchievements" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../store/game'
import Inventory from '../components/Inventory.vue'
import Map from '../components/Map.vue'
import Battle from '../components/Battle.vue'
import QuestLog from '../components/QuestLog.vue'
import Achievements from '../components/Achievements.vue'

const gameStore = useGameStore()
const showInventory = ref(false)
const showMap = ref(false)
const showBattle = ref(false)
const showQuestLog = ref(false)
const showAchievements = ref(false)
const currentEnemy = ref(null)

// 模拟任务数据
const quests = ref([
  {
    id: 1,
    name: '消灭洞穴巨人',
    description: '村庄附近的洞穴中出现了一个强大的巨人，威胁到了村民的安全。请前往洞穴消灭这个巨人，保护村庄的和平。',
    level: 2,
    type: 'kill',
    status: 'available',
    objectives: [
      {
        id: 1,
        description: '消灭洞穴巨人',
        current: 0,
        required: 1
      }
    ],
    rewards: {
      experience: 200,
      gold: 50,
      items: [
        {
          id: 101,
          name: '巨人之血',
          description: '洞穴巨人的血液，具有特殊的魔法属性。',
          type: 'material',
          rarity: 'uncommon',
          value: 25
        }
      ]
    }
  },
  {
    id: 2,
    name: '收集草药',
    description: '村庄的药剂师需要一些草药来制作治疗药水。请前往森林空地收集10份草药。',
    level: 1,
    type: 'collect',
    status: 'available',
    objectives: [
      {
        id: 2,
        description: '收集草药',
        current: 0,
        required: 10
      }
    ],
    rewards: {
      experience: 100,
      gold: 30
    }
  },
  {
    id: 3,
    name: '探索山脉',
    description: '村庄的村长希望有人能够探索村庄西边的山脉，了解那里的情况。',
    level: 1,
    type: 'explore',
    status: 'available',
    objectives: [
      {
        id: 3,
        description: '到达山脉',
        current: 0,
        required: 1
      }
    ],
    rewards: {
      experience: 50,
      gold: 20
    }
  }
])

// 模拟成就数据
const achievements = ref([
  {
    id: 1,
    name: '初次冒险',
    description: '开始你的第一次冒险',
    rarity: 'common',
    unlocked: true,
    unlockedDate: new Date().toISOString(),
    requirement: {
      type: 'scenes_visited',
      value: 1,
      description: '访问1个场景'
    },
    icon: '🚶'
  },
  {
    id: 2,
    name: '战斗新手',
    description: '完成你的第一次战斗',
    rarity: 'common',
    unlocked: false,
    requirement: {
      type: 'enemies_killed',
      value: 1,
      description: '击杀1个敌人'
    },
    icon: '⚔️'
  },
  {
    id: 3,
    name: '任务达人',
    description: '完成第一个任务',
    rarity: 'uncommon',
    unlocked: false,
    requirement: {
      type: 'quests_completed',
      value: 1,
      description: '完成1个任务'
    },
    icon: '📜'
  },
  {
    id: 4,
    name: '探险家',
    description: '探索所有场景',
    rarity: 'rare',
    unlocked: false,
    requirement: {
      type: 'scenes_visited',
      value: 7,
      description: '访问所有7个场景'
    },
    icon: '🗺️'
  },
  {
    id: 5,
    name: '传奇勇士',
    description: '达到10级',
    rarity: 'legendary',
    unlocked: false,
    requirement: {
      type: 'level',
      value: 10,
      description: '达到10级'
    },
    icon: '👑'
  }
])

const player = computed(() => gameStore.player)
const currentScene = computed(() => gameStore.currentScene)

// 模拟场景数据
const scenes = {
  village: {
    name: '宁静村庄',
    description: '这是一个宁静的小村庄，村民们过着平静的生活。村庄中央有一个广场，周围环绕着各种店铺和民宅。',
    exits: {
      '北': 'forest',
      '东': 'farm',
      '南': 'river',
      '西': 'mountain'
    },
    npcs: [
      { id: 1, name: '村长', description: '村庄的领导者，经验丰富的老人。' },
      { id: 2, name: '铁匠', description: '村庄里的铁匠，擅长打造武器和盔甲。' }
    ],
    items: [
      { id: 1, name: '治疗药水', description: '恢复20点生命值', type: 'potion', rarity: 'common', value: 10, effects: { health: 20 } },
      { id: 2, name: '金币', description: '可以用来购买物品', type: 'currency', rarity: 'common', value: 5 }
    ]
  },
  forest: {
    name: '神秘森林',
    description: '一片茂密的森林，树木高大茂盛，阳光透过树叶洒下斑驳的光影。森林中传来各种动物的叫声。',
    exits: {
      '南': 'village',
      '东': 'clearing'
    },
    npcs: [
      { id: 3, name: '猎人', description: '在森林中狩猎的猎人，熟悉森林的情况。' }
    ],
    items: [
      { id: 3, name: '蘑菇', description: '可以食用的蘑菇', type: 'food', rarity: 'common', value: 2 },
      { id: 4, name: '木材', description: '可以用来制作物品', type: 'material', rarity: 'common', value: 3 }
    ]
  },
  farm: {
    name: '丰收农场',
    description: '一片广阔的农场，种植着各种农作物。农夫们正在田间劳作，空气中弥漫着泥土的芬芳。',
    exits: {
      '西': 'village'
    },
    npcs: [
      { id: 4, name: '农夫', description: '在农场工作的农夫，勤劳朴实。' }
    ],
    items: [
      { id: 5, name: '苹果', description: '新鲜的苹果', type: 'food', rarity: 'common', value: 1 },
      { id: 6, name: '小麦', description: '可以用来制作面包', type: 'material', rarity: 'common', value: 2 }
    ]
  },
  river: {
    name: '清澈河流',
    description: '一条清澈的河流，河水缓缓流淌。河岸两边是茂密的草丛，偶尔可以看到鱼儿在水中游动。',
    exits: {
      '北': 'village'
    },
    npcs: [],
    items: [
      { id: 7, name: '鱼', description: '新鲜的鱼', type: 'food', rarity: 'common', value: 3 },
      { id: 8, name: '石头', description: '可以用来制作工具', type: 'material', rarity: 'common', value: 1 }
    ]
  },
  mountain: {
    name: '雄伟山脉',
    description: '一座雄伟的山脉，山峰高耸入云。山上有各种矿物和宝石，是冒险者的天堂。',
    exits: {
      '东': 'village',
      '北': 'cave'
    },
    npcs: [
      { id: 5, name: '矿工', description: '在山中采矿的矿工，知道很多宝藏的位置。' }
    ],
    items: [
      { id: 9, name: '铁矿石', description: '可以用来制作武器', type: 'material', rarity: 'uncommon', value: 4 },
      { id: 10, name: '宝石', description: '珍贵的宝石', type: 'treasure', rarity: 'rare', value: 20 }
    ]
  },
  clearing: {
    name: '森林空地',
    description: '森林中的一片空地，阳光充足。这里是野生动物的栖息地，偶尔可以看到鹿和兔子。',
    exits: {
      '西': 'forest'
    },
    npcs: [],
    items: [
      { id: 11, name: '草药', description: '可以用来制作药水', type: 'material', rarity: 'common', value: 2 },
      { id: 12, name: '兽皮', description: '可以用来制作盔甲', type: 'material', rarity: 'uncommon', value: 5 }
    ]
  },
  cave: {
    name: '黑暗洞穴',
    description: '山中的一个黑暗洞穴，入口处有微弱的光线。洞穴深处传来奇怪的声音，可能有危险。',
    exits: {
      '南': 'mountain'
    },
    npcs: [
      { id: 6, name: '洞穴巨人', description: '居住在洞穴中的巨人，非常强壮。', isEnemy: true, level: 3, icon: '👹' }
    ],
    items: [
      { id: 13, name: '魔法水晶', description: '蕴含魔法能量的水晶', type: 'treasure', rarity: 'epic', value: 30 },
      { id: 14, name: '骷髅钥匙', description: '一把古老的钥匙，不知道有什么用', type: 'key', rarity: 'uncommon', value: 1 }
    ]
  }
}

const sceneName = computed(() => scenes[currentScene.value]?.name || '未知场景')
const sceneDescription = computed(() => scenes[currentScene.value]?.description || '场景描述缺失')
const sceneExits = computed(() => scenes[currentScene.value]?.exits || {})
const sceneNPCs = computed(() => scenes[currentScene.value]?.npcs || [])
const sceneItems = computed(() => scenes[currentScene.value]?.items || [])

const goToScene = (sceneName) => {
  gameStore.changeScene(sceneName)
  
  // 检查是否有探索类型的任务需要更新
  quests.value.forEach(quest => {
    if (quest.type === 'explore' && quest.status === 'accepted') {
      quest.objectives.forEach(objective => {
        if (objective.description.includes('山脉') && sceneName === 'mountain') {
          objective.current = 1
          // 检查任务是否完成
          const allCompleted = quest.objectives.every(obj => obj.current >= obj.required)
          if (allCompleted) {
            quest.status = 'completed'
          }
        }
      })
    }
  })
  
  // 检查是否解锁探险家成就
  const exploreAchievement = achievements.value.find(a => a.id === 4)
  if (exploreAchievement && !exploreAchievement.unlocked) {
    // 这里简化处理，实际应该跟踪玩家访问过的场景数量
    // 假设玩家已经访问了所有场景
    exploreAchievement.unlocked = true
    exploreAchievement.unlockedDate = new Date().toISOString()
  }
}

const talkToNPC = (npc) => {
  if (npc.isEnemy) {
    // 如果是敌人，触发战斗
    startBattle(npc)
  } else {
    // 否则，实现与NPC交谈的逻辑
    console.log('与', npc.name, '交谈')
  }
}

const startBattle = (enemy) => {
  currentEnemy.value = {
    ...enemy,
    health: 50 + enemy.level * 10,
    attack: 10 + enemy.level * 2,
    defense: 5 + enemy.level
  }
  showBattle.value = true
}

const closeBattle = () => {
  showBattle.value = false
  currentEnemy.value = null
}

const handleBattleResult = (result) => {
  console.log('战斗结果:', result)
  // 这里可以处理战斗结果，比如显示奖励、更新游戏状态等
  
  // 如果战斗胜利，更新任务进度
  if (result.result === 'victory') {
    // 检查是否有击杀类型的任务需要更新
    quests.value.forEach(quest => {
      if (quest.type === 'kill' && quest.status === 'accepted') {
        quest.objectives.forEach(objective => {
          if (objective.description.includes('洞穴巨人') && currentEnemy.value.name === '洞穴巨人') {
            objective.current = 1
            // 检查任务是否完成
            const allCompleted = quest.objectives.every(obj => obj.current >= obj.required)
            if (allCompleted) {
              quest.status = 'completed'
            }
          }
        })
      }
    })
    
    // 检查是否解锁战斗新手成就
    const battleAchievement = achievements.value.find(a => a.id === 2)
    if (battleAchievement && !battleAchievement.unlocked) {
      battleAchievement.unlocked = true
      battleAchievement.unlockedDate = new Date().toISOString()
    }
  }
}

// 打开任务日志
const openQuestLog = () => {
  showQuestLog.value = true
}

// 关闭任务日志
const closeQuestLog = () => {
  showQuestLog.value = false
}

// 打开成就界面
const openAchievements = () => {
  showAchievements.value = true
}

// 关闭成就界面
const closeAchievements = () => {
  showAchievements.value = false
}

// 接受任务
const acceptQuest = (quest) => {
  quest.status = 'accepted'
  console.log('接受了任务:', quest.name)
}

// 提交任务
const turnInQuest = (quest) => {
  quest.status = 'turned_in'
  console.log('提交了任务:', quest.name)
  
  // 给予任务奖励
  if (quest.rewards.experience) {
    gameStore.addExperience(quest.rewards.experience)
  }
  
  // 检查是否解锁任务达人成就
  const questAchievement = achievements.value.find(a => a.id === 3)
  if (questAchievement && !questAchievement.unlocked) {
    questAchievement.unlocked = true
    questAchievement.unlockedDate = new Date().toISOString()
  }
}



const pickUpItem = (item) => {
  gameStore.addItem(item)
  console.log('拾取了', item.name)
  // 这里可以实现从场景中移除物品的逻辑
}

const openInventory = () => {
  showInventory.value = true
}

const closeInventory = () => {
  showInventory.value = false
}

const openMap = () => {
  showMap.value = true
}

const closeMap = () => {
  showMap.value = false
}

const pauseGame = () => {
  gameStore.pauseGame()
  console.log('游戏暂停')
}
</script>

<style scoped>
.scene-view {
  min-height: 100vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.scene-header {
  background-color: #343a40;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.scene-header h2 {
  margin-bottom: 15px;
}

.player-status {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.status-item {
  flex: 1;
  min-width: 200px;
}

.status-item span {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.health {
  background-color: #28a745;
}

.progress-fill.mana {
  background-color: #007bff;
}

.scene-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.scene-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.scene-actions h3,
.scene-entities h3,
.scene-items h3 {
  margin-bottom: 10px;
  color: #343a40;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.action-buttons button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-buttons button:hover {
  background-color: #0069d9;
}

.entity-list,
.item-list {
  list-style: none;
  margin-bottom: 20px;
}

.entity-list li,
.item-list li {
  padding: 10px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entity-list li button,
.item-list li button {
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.entity-list li button:hover,
.item-list li button:hover {
  background-color: #218838;
}

.scene-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.scene-footer button {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.scene-footer button:hover {
  background-color: #5a6268;
}
</style>