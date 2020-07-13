import http.client
import json
import time
import sys
import collections

import csv


conn = http.client.HTTPSConnection("api.themoviedb.org")

payload = "{}"

b=sys.argv[1]



count=0;
with open('movie_ID_name.csv',mode='w') as movies:
	fieldnames=['Movie ID','Title']
	movie_writer=csv.DictWriter(movies,delimiter=',',fieldnames=fieldnames)
	movie_writer.writeheader()

with open('movie_ID_name.csv',mode='w') as movies:
	fieldnames=['Movie ID','Title']
	movie_writer=csv.DictWriter(movies,delimiter=',',fieldnames=fieldnames)
#&include_video=false&include_adult=false
	for i in range(18):
		a=i+1;
		#print (i)
		time.sleep(.30)    
		conn.request("GET", "/3/discover/movie?page=%(a)d&primary_release_date.gte=2004-01-01&with_genres=18&sort_by=popularity.desc&api_key=%(arg)s"%{"a":a,"arg":b},payload)
		res = conn.getresponse()
		d = res.read().decode("utf-8")
		data = json.loads(d)
		data=data["results"]
		#print("id,title")
		if i==17:
			m=10
		else:
			m=len(data)
	
		for j in range(m):
			#print(data[j]["id"],",",data[j]["title"],",",data[j]["release_date"])
			movie_writer.writerow({'Movie ID':data[j]["id"],'Title':data[j]["original_title"]})
			
gh=[[0 for x in range(2)] for y in range(1750)]	
with open('movie_ID_name.csv',mode='r') as movies:
	fieldnames=['Movie ID','Title']
	movie_reader=csv.DictReader(movies,fieldnames=fieldnames)
	with open('movie_ID_sim_movie_ID.csv',mode='w') as smovies:
		fd=['ID1','ID2']
		sm_writer=csv.DictWriter(smovies,delimiter=',',fieldnames=fd)
		
		for i in range(350):
			a=next(movie_reader)['Movie ID']
			time.sleep(.30)
			conn.request("GET", "/3/movie/%(a)s/similar?page=1&api_key=%(arg)s"%{"a":a,"arg":b}, payload)
			res=conn.getresponse()
			d=res.read().decode("utf-8")
			data = json.loads(d)
			
			data=data["results"]
			if len(data)<=5:
				m=len(data)
					
			else:
				m=5	
		
				
			for j in range(m):
			
				x=0
				#print(a,count)				
				for k in range(count):
					if str(gh[k][1])==str(a):						
						if str(gh[k][0])==str(data[j]["id"]):
							x=1
							if int(gh[k][0])>int(a):
								#print(str(gh[k][0]),",",str(a))
								for o in range(k,count-1):
									gh[o][0]=gh[o+1][0]
									gh[o][1]=gh[o+1][1]
								gh[count-1][0]=str(a)
								gh[count-1][1]=data[j]["id"]
							break
			
				
				if x==0:
					#sm_writer.writerow({'ID1':a,'ID2':data[j]["id"]})						
					gh[count][0]=a
					gh[count][1]=data[j]["id"]	
					count=count+1;	
		k=0;			
		for k in range(count):
			sm_writer.writerow({'ID1':gh[k][0],'ID2':gh[k][1]})
									
							
	
						
						










