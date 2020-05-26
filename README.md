- Change `web_backend_db_data` volume name in docker-compose and Makefile
- run `make setup`
- set NGINX_SERVER_NAME and NGINX_BACKEND_HOST variables
- set parameter store variables
    * env-${envSettings.projectEnvName}-admin-panel/DJANGO_DEBUG
    * env-${envSettings.projectEnvName}-admin-panel/DJANGO_SECRET
    
TODO: 
- add lambda layers for requirements
- add slack notifications
