<template>
  <div class="container-lg p-4">
    <div class="Subhead">
      <h2 class="Subhead-heading">Upcoming events</h2>
      <div class="Subhead-actions">
        <router-link to="/list" class="btn btn-sm btn-secondary">Event list</router-link>
      </div>
    </div>
    <p>
      These are the upcoming tech events.
      You can subscribe to the calendar via <a href="https://calendar.google.com/calendar/embed?src=j5i0o6v2ihfboe19upl9lhonbci6ankr%40import.calendar.google.com&ctz=Asia%2FBangkok">Google Calendar</a>.
    </p>
    <div class="flash flash-error" v-if="!!error">
      <strong>Cannot load data.</strong> {{error.toString()}}
    </div>
    <div class="Box mt-3" v-if="loading">
      <ul>
        <li class="Box-row text-center p-4">
          <spinner></spinner>
        </li>
      </ul>
    </div>
    <div class="Box mt-3" v-if="topUpcomingEvents.length > 0">
      <ul>
        <li class="Box-row" v-for="events in topUpcomingEvents" :key="events.id">
          <event :event="events"></event>
        </li>
      </ul>
      <div class="Box-footer Box-row--gray text-center" v-if="upcomingEvents.length > topUpcomingEvents.length">
        <router-link to='/list'>See more events &rarr;</router-link>
      </div>
    </div>
    <div class="mt-3">
      <p>Missing events or details incorrect? <a href="https://github.com/ThaiProgrammer/tech-events-calendar/tree/master/CONTRIBUTING.md">Please contribute!</a></p>
    </div>

    <div class="Subhead Subhead--spacious">
      <h2 class="Subhead-heading">2018 calendar</h2>
    </div>
    <div class="year-calendar">
      <router-link to="/list">
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-01.svg" alt="January 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-02.svg" alt="February 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-03.svg" alt="March 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-04.svg" alt="April 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-05.svg" alt="May 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-06.svg" alt="June 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-07.svg" alt="July 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-08.svg" alt="August 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-09.svg" alt="September 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-10.svg" alt="October 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-11.svg" alt="November 2018" width="200" height="185" />
        <img src="https://thaiprogrammer-tech-events-calendar.netlify.com/generated/calendar-images/2018-12.svg" alt="December 2018" width="200" height="185" />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Event from './Event'
import Spinner from './Spinner'

export default {
  computed: {
    ...mapState([ 'loading', 'error', 'events' ]),
    upcomingEvents () {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      return this.events
        .filter(event => {
          const date = new Date(event.start.year, event.start.month - 1, event.start.date)
          return date >= now
        })
    },
    topUpcomingEvents () {
      console.log(this.upcomingEvents);
      return this.upcomingEvents.slice(0, 5)
    }
  },
  components: { Event, Spinner }
}
</script>

<style scoped>
  .year-calendar {
    max-width: 888px;
    margin: 0 auto;
    text-align: center;
  }
</style>
