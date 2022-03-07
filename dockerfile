FROM python:3.8-slim-buster
ENV PYTHONUNBUFFERED 1

# install dev packages in a virtual package .build-deps
RUN apt-get -y update && apt-get install -y --no-install-recommends\
    build-essential \
    python3-dev \
    cmake \
    libssl-dev libffi-dev libsm6 libxext6 libxrender-dev \
    default-libmysqlclient-dev \
    gcc \
    ffmpeg \
    libsm6 \
    libxext6 

RUN apt-get clean && apt-get autoclean && rm -rf /tmp/* /var/tmp/* /var/lib/apt/lists/*

# install rest of the dependencies
COPY ./requirements.txt /requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# remove dev packages
RUN apt-get autoremove --purge -y build-essential cmake python3-dev gcc

RUN mkdir /app
WORKDIR /app

# copy project code to the image
COPY ./ /app/

RUN python /app/manage.py makemigrations
RUN python /app/manage.py migrate

EXPOSE 8000