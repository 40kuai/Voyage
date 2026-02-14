class Player:
    def __init__(self, id, name, level=1, experience=0, health=100, mana=50, strength=10, agility=10, intelligence=10):
        self.id = id
        self.name = name
        self.level = level
        self.experience = experience
        self.health = health
        self.mana = mana
        self.strength = strength
        self.agility = agility
        self.intelligence = intelligence
        self.inventory = []
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'experience': self.experience,
            'health': self.health,
            'mana': self.mana,
            'strength': self.strength,
            'agility': self.agility,
            'intelligence': self.intelligence,
            'inventory': [item.to_dict() for item in self.inventory]
        }
    
    def add_experience(self, amount):
        self.experience += amount
        if self.experience >= self.level * 100:
            self.level += 1
            self.experience -= self.level * 100
            self.health += 10
            self.mana += 5
            self.strength += 2
            self.agility += 2
            self.intelligence += 2
    
    def take_damage(self, amount):
        self.health -= amount
        return self.health <= 0
    
    def heal(self, amount):
        self.health = min(self.health + amount, 100)
    
    def add_item(self, item):
        self.inventory.append(item)
    
    def remove_item(self, item_id):
        self.inventory = [item for item in self.inventory if item.id != item_id]

class Item:
    def __init__(self, id, name, description, type, value, effects=None):
        self.id = id
        self.name = name
        self.description = description
        self.type = type  # weapon, armor, potion, etc.
        self.value = value
        self.effects = effects or {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'value': self.value,
            'effects': self.effects
        }

class Scene:
    def __init__(self, id, name, description, exits=None, npcs=None, items=None):
        self.id = id
        self.name = name
        self.description = description
        self.exits = exits or {}
        self.npcs = npcs or []
        self.items = items or []
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'exits': self.exits,
            'npcs': [npc.to_dict() for npc in self.npcs],
            'items': [item.to_dict() for item in self.items]
        }

class NPC:
    def __init__(self, id, name, description, dialogues=None, quests=None):
        self.id = id
        self.name = name
        self.description = description
        self.dialogues = dialogues or []
        self.quests = quests or []
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'dialogues': self.dialogues,
            'quests': [quest.to_dict() for quest in self.quests]
        }

class Quest:
    def __init__(self, id, name, description, objectives, rewards, status='available'):
        self.id = id
        self.name = name
        self.description = description
        self.objectives = objectives
        self.rewards = rewards
        self.status = status  # available, accepted, completed
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'objectives': self.objectives,
            'rewards': self.rewards,
            'status': self.status
        }