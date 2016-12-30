# Account

## POST /login
This route is used to login. See [Usage](usage#logging-in)

## POST /signup
This route is used to signup. See [Usage](usage#signin-up)

## POST /logout
_Need Login_

This route is used to logout.

# Announcements

## GET /announcements
This route is used to get all announcements.
> Returns: [`ShortAnnouncement[]`](types#announcement)

## POST /announcements
_Need Login_

This route is used to create a new announcement
> Returns:  `boolean`

## GET /announcements/:city
This route is used to get all announcements in a specific `city`.
> Returns: [`ShortAnnouncement[]`](types#announcement)

## GET /announcements/user
This route is used to get all announcements of user (cookies needed).
> Returns: [`Announcement[]`](types#announcement)

## GET /announcement/:uuid
This route is used to get the announcement with the specified `uuid`
> Returns:  [`Announcement`](types#announcement)

## PUT /announcement/:uuid
_Need Login_

This route is used to update the announcement with the specified `uuid`
> Returns:  [`Announcement`](types#announcement)

## DELETE /announcement/:uuid
_Need Login_

This route is used to delete the announcement with the specified `uuid`
> Returns:  `boolean`

# User

## GET /user/:phone
This route is used to get the user with the specified `phone` number.

## PUT /user
_Need login_

This route is used to edit the user (cookies needed).
> Returns:  `boolean`
