<script lang="ts">
import { defineComponent } from 'vue'
import { use_database } from '../stores/database_store'
import { use_notification } from '../stores/notification_store'
import { Team } from '../models/team'

type State = 'loading' | 'viewing' | 'editing'
type Event = 'edit' | 'save' | 'cancel' | 'load' | 'remove'

const db = use_database()
const { show } = use_notification()

export default defineComponent({
    props: {
        mentor_id: { type: Number, required: true },
        team_id: { type: Number, required: true }
    },
    emits: ['saved', 'invalid', 'deleted'],
    async mounted() {
        this.team = await db.get_team_by_id(this.mentor_id, this.team_id)
        this.send('load')
    },
    data() {
        return {
            state: 'viewing' as State,
            team: undefined as Team | undefined,
            move: undefined as number | undefined
        }
    },
    methods: {
        send(event: Event) {
            switch (event) {
                case 'edit':
                    this.state = 'editing'
                    break
                case 'save': {
                    const validation = this.validate()
                    if (validation !== true) {
                        this.$emit('invalid')
                        show(validation[1], true)
                    } else {
                        db.update_team(this.mentor_id, this.team_id, this.team.project, this.team.members.split(','))
                        this.team.members = this.team.members.split(',')
                    }
                }
                    this.state = 'viewing'
                    break
                case 'cancel':
                    db.get_team_by_id(this.mentor_id, this.team_id)
                        .then(t => this.team = t)
                        .then(_ => this.state = 'viewing')
                    break
                case 'load':
                    this.state = 'viewing'
                    break
                case 'remove':
                    db.remove_team_by_id(this.mentor_id, this.team_id)
                        .then(_ => this.$emit('deleted'))
                    break
            }
        },
        validate(): [false, string] | true {
            if (this.team.project.trim() === '')
                return [false, 'Имя проекта не должно быть пустым']
            return true
        }
    }
})
</script>

<template>
    <div class="card" draggable="true" v-if="team !== undefined">
        <div class="card-header has-background-dark">
            <div class="card-header-title has-text-light" v-if="state === 'viewing'">
                Проект: «{{ team.project }}»
            </div>
            <div class="card-header-title has-text-light" v-else>
                <input class="input" v-model="team.project">
            </div>
        </div>
        <div class="card-content">
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p>Специализация:</p>
                    </div>
                    <div class="column has-text-right">
                        <p>{{ team.specialization }}</p>
                    </div>
                </div>
            </div>
            <div>
                <div class="columns is-mobile">
                    <div class="column">
                        <p>Участники проекта:</p>
                    </div>
                    <div class="column has-text-right" v-if="state === 'viewing'">
                        <li v-for="member in team.members" :key="member">{{ member }}</li>
                    </div>
                    <div v-else class="column">
                        <textarea class="w-100 input" v-model="team.members"></textarea>
                    </div>
                </div>
            </div>
            <div>
                <div class="columns is-mobile" v-if="state === 'editing'">
                    <div class="column">Переместить к:</div>
                    <div class="column">
                        <div class="select">
                            <select v-model="move">
                                <option selected :value="undefined" disabled>Выбрать</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer" v-if="state === 'viewing'">
            <a @click="send('edit')" class="card-footer-item">Изменить</a>
            <a @click="send('remove')" class="card-footer-item">Удалить</a>
        </div>
        <div class="card-footer" v-else>
            <a @click="send('save')" class="card-footer-item">Сохранить</a>
            <a @click="send('cancel')" class="card-footer-item">Отменить</a>
        </div>
    </div>
</template>

<style scoped>
.w-100 {
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    resize: vertical;
}
</style>