# matrix-send-job-form

A `@sctlib/mwc` HTML form template for `today.joblist.job` event CRUD.

It is using the `@sctlib/libli` send track component as template, to
try and fetch "oembed" information from a linked URL.

It currently represents the "matrix joblist job model", as the form's
"named inputs" are used for the matrix `event.content` key and values.


## Improvements

This template should be improved, to support an improved "job event
model", that should support:

- position on a map (like companies in the git data repo), to position
  a job on the map
- position/address, so a job can be located in a country or remote
- `company` from the `id` of a company, to associate it to an
  exsting "git static file data model"; if not available from a room
  widget describing the company (tbd)
