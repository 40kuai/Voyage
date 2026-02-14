<template>
  <div class="battle">
    <div class="battle-header">
      <h2>战斗</h2>
      <button @click="fleeBattle" class="flee-button">逃跑</button>
    </div>
    
    <div class="battle-content">
      <!-- 敌人信息 -->
      <div class="enemy-section">
        <div class="enemy-card">
          <div class="enemy-icon">{{ enemy.icon }}</div>
          <div class="enemy-info">
            <h3>{{ enemy.name }}</h3>
            <div class="enemy-stats">
              <div class="stat">
                <span>等级: {{ enemy.level }}</span>
              </div>
              <div class="stat">
                <span>生命值: {{ enemy.health }}/{{ enemy.maxHealth }}</span>
                <div class="progress-bar">
                  <div class="progress-fill enemy-health" :style="{ width: (enemy.health / enemy.maxHealth) * 100 + '%' }"></div>
                </div>
              </div>
              <div class="stat">
                <span>攻击力: {{ enemy.attack }}</span>
              </div>
              <div class="stat">
                <span>防御力: {{ enemy.defense }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 战斗日志 -->
      <div class="battle-log">
        <h3>战斗日志</h3>
        <div class="log-content">
          <div v-for="(log, index) in battleLog" :key="index" class="log-entry">
            {{ log }}
          </div>
        </div>
      </div>
      
      <!-- 玩家操作 -->
      <div class="player-actions">
        <h3>选择行动</h3>
        <div class="action-buttons">
          <button @click="attackEnemy" class="attack-button">攻击</button>
          <button @click="useSkill" class="skill-button">技能</button>
          <button @click="useItemInBattle" class="item-button">使用物品</button>
          <button @click="defend" class="defend-button">防御</button>
        </div>
      </div>
      
      <!-- 技能选择 (默认隐藏) -->
      <div v-if="showSkills" class="skill-selection">
        <h4>选择技能</h4>
        <div class="skill-buttons">
          <button v-for="skill in playerSkills" :key="skill.id" @click="useSelectedSkill(skill)" class="skill-btn">
            {{ skill.name }} ({{ skill.manaCost }} MP)
          </button>
        </div>
        <button @click="cancelSkillSelection" class="cancel-button">取消</button>
      </div>
      
      <!-- 物品选择 (默认隐藏) -->
      <div v-if="showItems" class="item-selection">
        <h4>选择物品</h4>
        <div class="item-buttons">
          <button v-for="item in usableItems" :key="item.id" @click="useSelectedItem(item)" class="item-btn">
            {{ item.name }}
          </button>
        </div>
        <button @click="cancelItemSelection" class="cancel-button">取消</button>
      </div>
    </div>
    
    <!-- 战斗结束面板 -->
    <div v-if="battleEnded" class="battle-end-panel">
      <h2>{{ battleResult === 'victory' ? '胜利!' : '失败!' }}</h2>
      <div v-if="battleResult === 'victory'" class="victory-rewards">
        <p>你获得了 {{ experienceGained }} 点经验值!</p>
        <p v-if="loot.length > 0">你获得了以下物品:</p>
        <ul v-if="loot.length > 0" class="loot-list">
          <li v-for="item in loot" :key="item.id">
            {{ item.name }}
          </li>
        </ul>
      </div>
      <div v-else class="defeat-message">
        <p>你被击败了...</p>
      </div>
      <button @click="endBattle" class="end-button">结束战斗</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../store/game'
import { canUseItem, useItemEffect } from '../utils/itemUtils'

const props = defineProps({
  enemy: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'battle-result'])

const gameStore = useGameStore()
const battleLog = ref([])
const battleEnded = ref(false)
const battleResult = ref('')
const experienceGained = ref(0)
const loot = ref([])
const showSkills = ref(false)
const showItems = ref(false)
const isPlayerTurn = ref(true)
const defenseActive = ref(false)

// 玩家技能列表
const playerSkills = ref([
  {
    id: 1,
    name: '普通攻击',
    description: '基础攻击，造成物理伤害',
    manaCost: 0,
    damage: 'physical',
    power: 1.0
  },
  {
    id: 2,
    name: '魔法箭',
    description: '释放魔法箭，造成魔法伤害',
    manaCost: 10,
    damage: 'magic',
    power: 1.2
  },
  {
    id: 3,
    name: '治疗术',
    description: '恢复生命值',
    manaCost: 15,
    damage: 'heal',
    power: 0.5
  }
])

// 可用物品列表
const usableItems = computed(() => {
  return gameStore.player.inventory.filter(item => canUseItem(item))
})

// 敌人状态
const enemy = ref({
  ...props.enemy,
  maxHealth: props.enemy.health
})

// 玩家状态
const player = computed(() => gameStore.player)

onMounted(() => {
  startBattle()
})

// 开始战斗
const startBattle = () => {
  battleLog.value = []
  battleLog.value.push(`战斗开始！你遇到了 ${enemy.value.name}！`)
  battleLog.value.push(`${enemy.value.name} 的生命值: ${enemy.value.health}`)
}

// 玩家攻击
const attackEnemy = () => {
  if (!isPlayerTurn.value || battleEnded.value) return
  
  // 计算伤害
  const damage = calculateDamage(player.value.strength, enemy.value.defense)
  enemy.value.health -= damage
  
  battleLog.value.push(`你对 ${enemy.value.name} 造成了 ${damage} 点伤害！`)
  
  // 检查敌人是否死亡
  if (enemy.value.health <= 0) {
    enemy.value.health = 0
    battleLog.value.push(`${enemy.value.name} 被击败了！`)
    endBattleWithVictory()
    return
  }
  
  // 切换到敌人回合
  isPlayerTurn.value = false
  setTimeout(enemyAttack, 1000)
}

// 敌人攻击
const enemyAttack = () => {
  if (battleEnded.value) return
  
  // 计算伤害
  let damage = calculateDamage(enemy.value.attack, player.value.agility)
  
  // 如果玩家防御，减少伤害
  if (defenseActive.value) {
    damage = Math.floor(damage * 0.5)
    battleLog.value.push('你的防御减少了伤害！')
    defenseActive.value = false
  }
  
  gameStore.takeDamage(damage)
  
  battleLog.value.push(`${enemy.value.name} 对你造成了 ${damage} 点伤害！`)
  
  // 检查玩家是否死亡
  if (player.value.health <= 0) {
    battleLog.value.push('你被击败了！')
    endBattleWithDefeat()
    return
  }
  
  // 切换到玩家回合
  isPlayerTurn.value = true
}

// 使用技能
const useSkill = () => {
  if (!isPlayerTurn.value || battleEnded.value) return
  showSkills.value = true
}

// 使用选定的技能
const useSelectedSkill = (skill) => {
  if (player.value.mana < skill.manaCost) {
    battleLog.value.push('法力不足！')
    showSkills.value = false
    return
  }
  
  // 消耗法力
  gameStore.player.mana -= skill.manaCost
  
  if (skill.damage === 'heal') {
    // 治疗技能
    const healAmount = Math.floor(player.value.intelligence * skill.power * 10)
    gameStore.heal(healAmount)
    battleLog.value.push(`你使用了 ${skill.name}，恢复了 ${healAmount} 点生命值！`)
  } else {
    // 伤害技能
    let damage
    if (skill.damage === 'physical') {
      damage = calculateDamage(player.value.strength * skill.power, enemy.value.defense)
    } else {
      damage = calculateDamage(player.value.intelligence * skill.power, enemy.value.defense * 0.5)
    }
    
    enemy.value.health -= damage
    battleLog.value.push(`你使用了 ${skill.name}，对 ${enemy.value.name} 造成了 ${damage} 点伤害！`)
    
    // 检查敌人是否死亡
    if (enemy.value.health <= 0) {
      enemy.value.health = 0
      battleLog.value.push(`${enemy.value.name} 被击败了！`)
      endBattleWithVictory()
      showSkills.value = false
      return
    }
  }
  
  showSkills.value = false
  
  // 切换到敌人回合
  isPlayerTurn.value = false
  setTimeout(enemyAttack, 1000)
}

// 取消技能选择
const cancelSkillSelection = () => {
  showSkills.value = false
}

// 使用物品
const useItemInBattle = () => {
  if (!isPlayerTurn.value || battleEnded.value) return
  showItems.value = true
}

// 使用选定的物品
const useSelectedItem = (item) => {
  const result = useItemEffect(item, gameStore.player)
  if (result.used) {
    battleLog.value.push(result.message)
    gameStore.removeItem(item.id)
  }
  
  showItems.value = false
  
  // 切换到敌人回合
  isPlayerTurn.value = false
  setTimeout(enemyAttack, 1000)
}

// 取消物品选择
const cancelItemSelection = () => {
  showItems.value = false
}

// 防御
const defend = () => {
  if (!isPlayerTurn.value || battleEnded.value) return
  
  defenseActive.value = true
  battleLog.value.push('你进入了防御状态！')
  
  // 切换到敌人回合
  isPlayerTurn.value = false
  setTimeout(enemyAttack, 1000)
}

// 逃跑
const fleeBattle = () => {
  if (battleEnded.value) return
  
  // 计算逃跑成功率
  const fleeChance = 0.7
  const fled = Math.random() < fleeChance
  
  if (fled) {
    battleLog.value.push('你成功逃跑了！')
    emit('battle-result', { result: 'fled' })
    emit('close')
  } else {
    battleLog.value.push('逃跑失败！')
    
    // 敌人反击
    isPlayerTurn.value = false
    setTimeout(enemyAttack, 1000)
  }
}

// 计算伤害
const calculateDamage = (attack, defense) => {
  // 基础伤害计算公式
  const baseDamage = Math.max(1, attack - Math.floor(defense * 0.5))
  // 添加随机波动
  const variance = 0.8 + Math.random() * 0.4 // 0.8 到 1.2 之间的随机值
  return Math.floor(baseDamage * variance)
}

// 胜利结束战斗
const endBattleWithVictory = () => {
  battleEnded.value = true
  battleResult.value = 'victory'
  
  // 计算经验值
  const exp = enemy.value.level * 20
  experienceGained.value = exp
  gameStore.addExperience(exp)
  
  // 生成战利品
  generateLoot()
  
  // 添加物品到背包
  loot.value.forEach(item => {
    gameStore.addItem(item)
  })
  
  emit('battle-result', { result: 'victory', experience: exp, loot: loot.value })
}

// 失败结束战斗
const endBattleWithDefeat = () => {
  battleEnded.value = true
  battleResult.value = 'defeat'
  gameStore.endGame()
  emit('battle-result', { result: 'defeat' })
}

// 结束战斗
const endBattle = () => {
  emit('close')
}

// 生成战利品
const generateLoot = () => {
  // 简单的战利品生成逻辑
  const lootChance = 0.8
  if (Math.random() < lootChance) {
    // 根据敌人等级生成物品
    const itemLevel = enemy.value.level
    const itemTypes = ['potion', 'food', 'material', 'currency']
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)]
    
    let item
    switch (randomType) {
      case 'potion':
        item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: '治疗药水',
          description: '恢复20点生命值',
          type: 'potion',
          rarity: 'common',
          value: 10,
          effects: { health: 20 }
        }
        break
      case 'food':
        item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: '面包',
          description: '恢复10点生命值',
          type: 'food',
          rarity: 'common',
          value: 3,
          effects: { health: 10 }
        }
        break
      case 'material':
        item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: '兽骨',
          description: '可以用来制作物品',
          type: 'material',
          rarity: 'common',
          value: 2
        }
        break
      case 'currency':
        item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: '金币',
          description: '可以用来购买物品的货币',
          type: 'currency',
          rarity: 'common',
          value: itemLevel * 5
        }
        break
    }
    
    if (item) {
      loot.value.push(item)
    }
  }
}
</script>

<style scoped>
.battle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.battle-header {
  padding: 20px;
  border-bottom: 1px solid #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battle-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.flee-button {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.flee-button:hover {
  background-color: #5a6268;
}

.battle-content {
  flex: 1;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  grid-template-areas:
    "enemy enemy"
    "log log"
    "actions actions";
}

.enemy-section {
  grid-area: enemy;
}

.enemy-card {
  background-color: #343a40;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.enemy-icon {
  font-size: 4rem;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.enemy-info {
  flex: 1;
}

.enemy-info h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.enemy-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat span {
  font-size: 0.9rem;
  color: #ced4da;
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

.enemy-health {
  background-color: #dc3545;
}

.battle-log {
  grid-area: log;
  background-color: #343a40;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.battle-log h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.log-content {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.log-entry {
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-actions {
  grid-area: actions;
  background-color: #343a40;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.player-actions h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-buttons button {
  flex: 1;
  min-width: 100px;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s;
}

.attack-button {
  background-color: #dc3545;
  color: white;
}

.attack-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.skill-button {
  background-color: #007bff;
  color: white;
}

.skill-button:hover {
  background-color: #0069d9;
  transform: translateY(-2px);
}

.item-button {
  background-color: #28a745;
  color: white;
}

.item-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.defend-button {
  background-color: #ffc107;
  color: #212529;
}

.defend-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}

.skill-selection,
.item-selection {
  grid-area: actions;
  background-color: #343a40;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.skill-selection h4,
.item-selection h4 {
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.skill-buttons,
.item-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.skill-btn,
.item-btn {
  padding: 10px 15px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.skill-btn:hover,
.item-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.cancel-button {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.battle-end-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #343a40;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  min-width: 400px;
}

.battle-end-panel h2 {
  margin: 0 0 20px 0;
  font-size: 1.8rem;
  color: #ffc107;
}

.victory-rewards p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.loot-list {
  list-style: none;
  margin: 15px 0;
  padding: 0;
}

.loot-list li {
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 5px;
}

.defeat-message p {
  margin: 20px 0;
  font-size: 1.1rem;
  color: #dc3545;
}

.end-button {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.end-button:hover {
  background-color: #0069d9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .battle-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      "enemy"
      "log"
      "actions";
  }
  
  .enemy-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    min-width: auto;
  }
  
  .battle-end-panel {
    min-width: 90%;
    padding: 20px;
  }
}
</style>