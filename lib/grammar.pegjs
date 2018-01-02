event_month = "##" _ month:month _ year:$(number+) events:(event*) newline*
{
  return { month, year, events }
}

month
  = "January" { return 1 }
  / "February" { return 2 }
  / "March" { return 3 }
  / "April" { return 4 }
  / "May" { return 5 }
  / "June" { return 6 }
  / "July" { return 7 }
  / "August" { return 8 }
  / "September" { return 9 }
  / "October" { return 10 }
  / "November" { return 11 }
  / "December" { return 12 }

event = newline+ header:header newline content:content { return { header, content } }

header = "###" _ day:event_date _ date:event_week_day ":" title:text newline
{
  return {
    day,
    date,
    title: title.trim()
  }
}

event_date = from:$(number+) to:(_+ "~" _+ to:$(number+) { return to })?
{
  return { from, to }
}

event_week_day = "(" from:day to:(_+ "~" _+ to:day { return to })? ")"
{
  return { from, to }
}

day = "Mon"
 / "Tue"
 / "Wed"
 / "Thu"
 / "Fri"
 / "Sat"
 / "Sun"

content = table_header
  table_separator
    topic:table_topic
    location:table_location
    time:(table_time+)?
    website:table_website*
    ticket:table_ticket*
    rsvp:table_rsvp* newline
    summary:(summary newline)?
    description:description
{
  return {
    topic,
    location,
    time,
    website,
    ticket,
    rsvp,
    summary,
    description
  }
}

table_header = "|"_+"|"_+"|"_+"|" newline
table_separator = "|" _ "-"+ _ "|" _ "-"+ _ "|" _ "-"+ _ "|" newline
table_topic = "|" _ event_topic_icon _ "|" type:text "|" topic:text "|" newline
{
  return {
    categories: type.trim().split(/\s*,\s*/),
    topics: topic.trim().split(/\s*,\s*/),
  }
}
table_location = "|" _ event_location_icon _ "|" location:text "|" detail:(value:text "|" { return value })? newline
{
  return { title: location.trim(), detail: detail && detail.trim() }
}
table_time = "|" _ event_time_icon _ "|" _ from:time "~" to:time after:(flag:"++"? { return !!flag }) _ "|" agenda:(agenda:text "|" { return agenda })? newline
{
  return { from, to, after, agenda: agenda && agenda.trim() }
}
table_website = "|" _ event_website_icon _ "|" _ link:markdown_link _ "|" newline { return { link: link } }
table_ticket = "|" _ event_ticket_icon _ "|" _ link:markdown_link _ "|" price:(price:text "|" { return price })? newline
{
  return { link, price: price && price.trim() }
}
table_rsvp = "|" _ event_check_icon _+ "|" _ link:markdown_link _ "|" detail:(text:text "|" { return text })? newline
{
  return { link, detail: detail && detail.trim() }
}

time = hour:$number+":"minute:$number+ { return { hour: +hour, minute: +minute } }

event_topic_icon = "\uD83C\uDFF7"
event_location_icon = "\uD83D\uDCCD"
event_website_icon = "\uD83C\uDFE0"
event_ticket_icon = "\uD83C\uDF9F"
event_time_icon = "\u231A\uFE0F"
event_check_icon = "\u2705"

markdown_link = "[" title:$(literal / number / _ / [.])+ "](" url:url ")" { return { title, url } }

summary = $(text newline)+
description = summary:(">" text:text? newline { return (text && text || "") + "\n" })+ { return summary.join('') }

url = $(literal / number / [/:.&=?-])+
text = $(literal / symbol / number / _)+
symbol = [,\/\\:."“”%;()\-…’[\]?!]
literal = [a-zA-Z\u0E00-\u0E7F]
number "number" = [0-9]
_ "space" = [ \t]
newline "newline" = [\n]
