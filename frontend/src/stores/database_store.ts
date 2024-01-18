import { type Ref, ref } from 'vue'
import { Mentor } from '../models/mentor'
import { use_notification } from './notification_store'
import { Team } from '../models/team'

const mentors_db: Ref<Set<number>> = ref(new Set())
const host = 'http://localhost:3000'

const { show } = use_notification()

function delay(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms)
    })
}

fetch(`${host}/api/mentor`, { method: 'GET' })
    .then(res => res.json())
    .then(it => mentors_db.value = new Set(it))
    .catch(e => show(`Невозможно подключиться к серверу: ${e}`, true))

export function use_database() {
    return {
        mentors: mentors_db,

        async add_mentor(fullname: string, spec: string) {
            const res = await fetch(`${host}/api/mentor`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullname, specialization: spec })
            })
            const id = (await res.json()).id
            mentors_db.value.add(id)
            return new Mentor(fullname, spec, [], id)
        },
        async get_mentor_by_id(id: number) {
            const res = await fetch(`${host}/api/mentor/${id}`)
            const result: Mentor = await res.json()
            return result
        },
        async remove_mentor_by_id(id: number) {
            mentors_db.value.delete(id)
            await fetch(`${host}/api/mentor/${id}`, {
                method: 'DELETE'
            })
        },
        async update_mentor({ fullname, id, specialization }: Mentor) {
            await fetch(`${host}/api/mentor/${id}`, {
                method: 'PATCH', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({ fullname, specialization })
            })
        },
        async add_team(mentor_id: number, members: string[], project: string, spec: string) {
            const res = await fetch(`${host}/api/mentor/${mentor_id}/team/`, {
                method: 'POSt', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({ project, specialization: spec, members })
            })
            const id = (await res.json()).id
            return new Team(id, project, spec, members)
        },
        async remove_team_by_id(mentor_id: number, team_id: number) {
            await fetch(`${host}/api/mentor/${mentor_id}/team/${team_id}`, {
                method: 'DELETE'
            })
        },
        async update_team(mentor_id: number, team_id: number, project: string, members: string[]) {
            await fetch(`${host}/api/mentor/${mentor_id}/team/${team_id}`, {
                method: 'PATCH', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({ project })
            })
            await fetch(`${host}/api/mentor/${mentor_id}/team/${team_id}/members`, {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({ members })
            })
        },
        async get_team_by_id(mentor_id: number, team_id: number): Promise<Team> {
            const res = await fetch(`${host}/api/mentor/${mentor_id}/team/${team_id}`)
            return res.json()
        },
        async reload_store() {
            mentors_db.value.clear()
            await fetch(`${host}/api/mentor`, { method: 'GET' })
                .then(res => res.json())
                .then(it => mentors_db.value = new Set(it))
                .catch(e => show(`Невозможно подключиться к серверу: ${e}`, true))
        }
    }
}