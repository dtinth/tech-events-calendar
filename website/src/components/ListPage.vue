<template>
  <div class="container-lg p-4">
    <nav class="UnderlineNav">
      <div class="UnderlineNav-body">
        <a
          href="javascript://"
          class="UnderlineNav-item"
          :class="{ selected: tab === 'upcoming' }"
          @click="changeTab('upcoming')"
        >
          Upcoming events <span class="Counter">{{upcomingEvents.length}}</span>
        </a>
        <a
          href="javascript://"
          class="UnderlineNav-item"
          :class="{ selected: tab === 'past' }"
          @click="changeTab('past')"
        >
          Past events <span class="Counter">{{pastEvents.length}}</span>
        </a>
      </div>
    </nav>
    <div class="flash flash-error mt-4" v-if="!!error">
      <strong>Cannot load data.</strong> {{error.toString()}}
    </div>
    <div class="Box mt-4" v-if="loading">
      <ul>
        <li class="Box-row text-center p-4">
          <spinner></spinner>
        </li>
      </ul>
    </div>
    <div class="Box mt-4" v-for="group in eventGroups" :key="group.id">
      <div class="Box-header">
        <h3 class="Box-title">{{group.title}}</h3>
      </div>
      <ul>
        <li class="Box-row" v-for="event in group.events" :key="event.id">
          <event :event="event"></event>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Event from './Event'
import Spinner from './Spinner'

export default {
  data () {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return { today, tab: 'upcoming' }
  },
  methods: {
    changeTab (tab) {
      this.tab = tab
    }
  },
  computed: {
    ...mapState([ 'loading', 'error', 'events' ]),
    upcomingEvents () {
      const { today, events } = this
      return events
        .filter(event => {
          const date = new Date(event.start.year, event.start.month - 1, event.start.date)
          return date >= today
        })
    },
    pastEvents () {
      const { today, events } = this
      return events
        .filter(event => {
          const date = new Date(event.start.year, event.start.month - 1, event.start.date)
          return date < today
        })
    },
    eventList () {
      return this.tab === 'upcoming' ? this.upcomingEvents : this.pastEvents
    },
    eventGroups () {
      const { today, eventList } = this
      const groups = [ ]
      const MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      const nextWeek = new Date(+today)
      nextWeek.setDate(nextWeek.getDate() + 7 - nextWeek.getDay())
      const next2Weeks = new Date(+nextWeek)
      next2Weeks.setDate(next2Weeks.getDate() + 7)
      const getGroupInfo = (event) => {
        const date = new Date(event.start.year, event.start.month - 1, event.start.date)
        if (date >= today && date < nextWeek) {
          return { title: 'This week', id: 'this-week' }
        }
        if (date >= today && date < next2Weeks) {
          return { title: 'Next week', id: 'next-week' }
        }
        return { title: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`, id: `${date.getFullYear()}-${date.getMonth()}` }
      }
      let currentGroup
      for (const event of eventList) {
        const groupInfo = getGroupInfo(event)
        if (!currentGroup || currentGroup.id !== groupInfo.id) {
          currentGroup = {
            id: groupInfo.id,
            title: groupInfo.title,
            events: [ ]
          }
          groups.push(currentGroup)
        }
        currentGroup.events.push(event)
      }
      return groups
    }
  },
  components: { Event, Spinner }
}
</script>

<style scoped>
</style>
