#!/bin/bash
set -e

function gunicorn_master_id() {
    echo "$(ps -ef | grep "gunicorn: master" | grep -v "grep" | awk {'print $2'})"
}

function number_of_gunicorn_workers() {
    echo "$(ps -ef | grep "gunicorn: worker" | grep -v "grep" | awk {'print $2'} | wc -l)"
}

function number_of_cpus() {
    echo "$(grep 'cpu cores' /proc/cpuinfo | wc -l)"
}

function max_workers() {
    let formula="2*$(number_of_cpus)+1"
    echo "${formula}"
}

function add_worker() {
    kill -TTIN "$(gunicorn_master_id)"
}

function remove_worker() {
    kill -TTOU "$(gunicorn_master_id)"
}

function slow_start() {
    slaves_nb=$(number_of_gunicorn_workers)
    max=$(max_workers)
    master_pid=$(gunicorn_master_id)
    echo "Number of workers: ${slaves_nb}, maximum number of workers: ${max})"
    echo "Gunicorn master pid: ${master_pid}"
    for ((i="${slaves_nb}";i<"${max}";i++));
    do
      echo "Adding new worker ${i}"
      add_worker
      echo "Workers: ${i} of ${max}"
      sleep 5
    done
    sleep 3
    echo "Result: $(number_of_gunicorn_workers) of $(max_workers) workers"
}
