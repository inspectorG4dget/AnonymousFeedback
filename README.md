Anonymous Feedback
======================

Small webapp to provide a anonymous feedback form for students to rate their TAs.
Its an all to common problem for students to not know their TA by name nor their email.
Our platform uses the course code and section to help find the TA students had.

## Setup

The application has two principal components: a PostgreSQL database backend,
and a Tornado application server. Before the application server will run, it
needs to establish a connection to the Postgres instance (via `dbconn.py`).


### Database configuration

Database configuration details are stored in a file called `dbconn.toml`, which
should be placed in the top level of the application (alongside `backend.py`). A
template TOML file is available as `dbconn.example.toml`; simply copy it to
`dbconn.toml` and update it with the Postgres credentials for the app.

After loading this data into the configuration file, the database must be
boostrapped. A bootstrapping script is available in `db_setup.sql`; this file
may be loaded into Postgres using the following command:

	# verbosely
	$ psql some_database -U some_user -a -f db_setup.sql --password

	# non-verbosely
	$ psql some_database -U some_user -f db_setup.sql --password

Once this step is complete, test data may be loaded into the database from
`db_test_data.sql` in the same way.

### Application configuration

By default, the application exposes a REST API on HTTP port 8888 and requires 
no special privileges.

It can be accessed using a browser on the same port.

The application requires Python 2, and specifically has been tested with Python
2.7. While it does not outright crash under Python 3, its correct performance is
not guaranteed, as only minimal testing has been carried out using Python 3.

### PyPI requirements

Exact PyPI package requirements are stored in `requirements.txt`, and can be
installed beforehand using `pip2 install -r requirements.txt`. Currently, these
requirements include:

- `tornado==4.4.2`
- `pg8000==1.10.6`
- `toml==0.9.2`

### Troubleshooting

**I added a course and a section, but I cannot view the section in the sections
dropdown when attempting to view feedback.**

- This is expected behaviour. A section will not show up as having feedback if
  it is inactive; a section is activated by having a TA assigned to it.

**I can't log into `psql` using the account I created.**

- By default, `psql` relies on peer authentication on login (this is why you
  usually `su postgres` before running `psql`). Update the following line in
  your `pg_hba.conf` file:

	  # before
      local      all	postgres	peer

      # after
      local	     all	postgres	md5

  If you still can't log in, try running:

     postgres=> ALTER USER some_user WITH LOGIN; 

**I can't access the application on the specified port.**

- 99% of the time, this is a firewall issue. If you're using an application
  firewall (default on Mac OS, Windows), whitelist the python2 process.
  
  If you're using a stateful firewall, whitelist incoming and outgoing TCP
  traffic on the specified port (default 8888), with source and destination
  whitelists as appropriate and necessary.

**The application won't run without superuser privileges when I try to run it on
port 80.**

- This is normal behaviour enforced by most modern OSes. Normally, this
  application should be run behind a web server proxy (normally, behind Nginx or
  Apache).

  Please read your web server's documentation to learn how to do this.

**I'm getting `403: Forbidden` statuses when I try to view pages served by the
application.**

- Normally, this is caused if incorrect permissions are set on the `assets/`
  directory. Make sure that the user running the Python process has recursive
  read permissions on that directory.

