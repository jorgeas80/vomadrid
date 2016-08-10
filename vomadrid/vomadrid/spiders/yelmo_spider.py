# -*- coding: utf-8 -*-
import scrapy
import json
import base64
import requests
from datetime import datetime
from vomadrid.items import VomadridItem


class YelmoSpider(scrapy.Spider):
    name = 'yelmo'
    handle_httpstatus_list = [400, 500]
    start_urls = [
        "https://dl.dropboxusercontent.com/u/6599273/scraping/vomadrid/yelmo_sample.json"
    ]

    yelmo_cinemas_with_vo = [
        (1, "Yelmo Cines Ideal", "https://goo.gl/maps/VnubJJuy6c62"),
        (6, "Yelmo Cines Plaza Norte II", "https://goo.gl/maps/HbDffXyFXGR2")
    ]

    def __init__(self, mongodb_uri='', mongodb_name=''):
        self.mongodb_uri = mongodb_uri
        self.mongodb_name = mongodb_name

    """def start_requests(self):
        payload = "{'cityKey':'madrid'}"
        url = 'http://www.yelmocines.es/now-playing.aspx/GetNowPlaying'
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8",

        }

        return [scrapy.FormRequest(url, method="POST", body=payload, headers=headers, callback=self.parse)]

        # This works too
        '''
        yield scrapy.http.Request(
            url,
            self.parse,
            method="POST",
            headers=headers,
            body=payload)
        '''
    """

    def parse(self, response):

        try:
            data = json.loads(response.body)

            # There are two yelmo cinemas with VO movies
            for pos, name, gmaps_url in self.yelmo_cinemas_with_vo:

                yelmo_data = data['d']['Cinemas'][pos]

                # Inside that element, we want the movies for today (position 0)
                yelmo_movies = yelmo_data["Dates"][0]["Movies"]

                # Let's read stuff
                for movie in yelmo_movies:

                    # In case the movie doesn't exist yet, we create a new register. For movie id, use the title without spaces and lowercase
                    movie_id = unicode(movie["Title"].replace(" ", "").lower())

                    movie_title = movie["Title"]
                    movie_original_title = movie["OriginalTitle"]
                    movie_runtime = movie["RunTime"]
                    movie_rating = movie["RatingDescription"]
                    movie_plot = movie["Synopsis"]

                    # Store the image in base64
                    movie_poster = ""
                    """
                    if movie["Poster"]:
                        response = requests.get(movie["Poster"])
                        movie_poster = ("data:" +
                                        response.headers['Content-Type'] + ";" +
                                        "base64," + base64.b64encode(response.content))
                    """

                    # Store the showtimes
                    movie_showtimes = []
                    for format in movie["Formats"]:
                        if format["Language"].upper() == "VOSE":
                            for showtime in format["Showtimes"]:
                                movie_showtimes.append({
                                    "cinema_name": name,
                                    "gmaps_url": gmaps_url,
                                    "time": showtime["Time"],
                                    "screennumber": showtime["Screen"],
                                    # TODO: Add google analytics code, if possible
                                    "buytickets": "http://inetvis.yelmocines.es/compra/visSelectTickets.aspx?cinemacode={}&txtSessionId={}".format(showtime["VistaCinemaId"], showtime["ShowtimeId"])
                                })

                    # Just yield a new item if there are available showtimes
                    if movie_showtimes:

                        # Store the element in MongoDB
                        item = VomadridItem()
                        item["movie_id"] = movie_id
                        item["movie_date_added"] = datetime.now().date().strftime("%Y-%m-%d")
                        item["movie_title"] = unicode(movie_title)
                        item["movie_original_title"] = unicode(movie_original_title)
                        item["movie_runtime"] = unicode(movie_runtime)
                        item["movie_rating"] = unicode(movie_rating)
                        item["movie_plot"] = unicode(movie_plot)
                        item["movie_poster"] = movie_poster
                        item["movie_showtimes"] = [{"yelmo": movie_showtimes}]

                        yield item

                    else:
                        yield None


        except Exception as error:
            # TODO: Log this!!
            yield None

