<script setup lang="ts">
import { ref } from 'vue'
import { Mentor } from './models/mentor'
import { use_database } from './stores/database_store'
import add_mentor_component from './components/AddMentorComponent.vue'
import add_team_component from './components/AddTeamComponent.vue'
import mentor_component from './components/MentorComponent.vue'
import team_component from './components/TeamComponent.vue'
import NotificationComponent from './components/NotificationComponent.vue'

const selected_mentor = ref<Mentor | undefined>(undefined)
const db = use_database()
</script>

<template>
    <header>
        <div class="navbar is-block has-background-light" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <div class="navbar-item">
                    <h1 class="has-text-weight-bold is-size-3">МКФОУ ВОШ №6969™</h1>
                </div>

                <div class="navbar-item ml-auto">
                    <a class="button is-hidden-mobile">
                        <span class="material-symbols-outlined icon">person</span>
                        <p>Личный кабинет</p>
                    </a>
                    <a class="button is-hidden-tablet">
                        <span class="material-symbols-outlined icon">person</span>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="section">
        <div class="container">
            <p class="title">Регистрация команд</p>

            <div class="columns">
                <div class="column is-5">
                    <div class="card">
                        <div class="card-header has-background-primary">
                            <div class="card-header-title">Наставники</div>
                            <img
                                class="card-header-icon my-auto"
                                src="./assets/icons/icons8-teacher-24.png"
                                alt="Mentor" />
                        </div>
                        <div class="card-content has-gap-y has-background-primary-light">
                            <add_mentor_component />
                            <div v-for="mentor_id in db.mentors.value" :key="mentor_id">
                                <mentor_component
                                    :mentor_id="mentor_id"
                                    @selected="(m) => selected_mentor = m"
                                    @deleted="db.remove_mentor_by_id(mentor_id).then(selected_mentor = undefined)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column" v-if="selected_mentor !== undefined">
                    <div class="card">
                        <div class="card-header has-background-info">
                            <div class="card-header-title">Команды наставника: {{ selected_mentor.fullname }}</div>
                            <img
                                class="card-header-icon my-auto"
                                src="./assets/icons/icons8-layers-24-linked.png"
                                alt="team" />
                        </div>
                        <div class="card-content has-background-info-light has-gap-y">
                            <add_team_component :mentor="selected_mentor"
                                                v-if="selected_mentor.teams.length <= 4"
                                                @saved="db.get_mentor_by_id(selected_mentor.id)
                                                    .then(m => selected_mentor = m)" />
                            <div v-for="team in selected_mentor.teams" :key="team.id">
                                <team_component :team_id="team.id" :mentor_id="selected_mentor.id"
                                                @saved="db.get_mentor_by_id(selected_mentor.id).then(m => selected_mentor = m)"
                                                @deleted="db.get_mentor_by_id(selected_mentor.id)
                                                    .then(m => selected_mentor = m)"
                                                @moved="db.reload_store().then(selected_mentor = undefined)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="content">
            <p>
                Created for <u><i>Technology of developing web-applications</i></u> course at
                <strong>BMSTU</strong>, Moscow.
            </p>
            <p>2024</p>
        </div>
    </footer>

    <notification-component />
</template>

<style scoped>
.card-header-icon {
    cursor: initial;
}

.has-gap-y > * {
    margin-bottom: 1rem;
}

.has-gap-y > *:last-child {
    margin-bottom: 0;
}
</style>
