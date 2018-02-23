<template>
  <div class="event">
    <div class="event-date">
      <strong>
        {{startDate}}
        <span v-if="startDate !== endDate"> ~<br>{{endDate}}</span>
      </strong>
      <br>
      {{day(event.start)}}<span v-if="startDate !== endDate"> – {{day(event.end)}}</span>
    </div>
    <div class="event-details">
      <div class="event-title">
        <strong>
          <router-link :to="href">{{event.title}}</router-link>
        </strong>
      </div>
      <div class="event-summary">
        {{event.summary}}
      </div>
      <div class="mt-1">
        <event-tags :event="event"></event-tags>
      </div>
    </div>
  </div>
</template>

<script>
import EventTags from './EventTags'
import Markdown from './Markdown'
export default {
  props: [ 'event' ],
  methods: {
    formatDate (d) {
      const month = ['?', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.month]
      return `${month} ${d.date}`
    },
    day (d) {
      const date = new Date(d.year, d.month - 1, d.date)
      return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]
    }
  },
  computed: {
    startDate () {
      return this.formatDate(this.event.start)
    },
    endDate () {
      return this.formatDate(this.event.end)
    },
    summary (){
      return Markdown.markdown([this.event.summary]);
    },
    href () {
      return `/event/${this.event.id}`
    }
  },
  components: {
    EventTags
  }
}
</script>

<style scoped>
.event {
  display: flex;
}
.event-date {
  width: 7em;
}
.event-details {
  flex: 1;
}

/* TODO dedupe event-tags */
.event-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
}
.event-tag {
  border-radius: 3px;
  background: #FAF8D1;
  color: #f49200;
  padding: 0.3em 0.9em;
  margin-right: 0.5em;
  margin-top: 0.5em;
  white-space: nowrap;
  text-decoration: none;
}
</style>
