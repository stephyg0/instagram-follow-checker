import json, zipfile, pathlib, struct
base=pathlib.Path(__file__).parent/'fixtures'
base.mkdir(exist_ok=True)
batch=base/'batch'
batch.mkdir(exist_ok=True)
def row(name): return {'string_list_data':[{'value':name,'href':'https://www.instagram.com/'+name+'/'}]}
for i in range(1,33):
    with zipfile.ZipFile(batch/f'export-{i:02}.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr(f'connections/followers_and_following/followers_{i}.json',json.dumps([row(f'friend{i}'),row('SHARED')]))
        z.writestr('messages/inbox/ignored.json','not JSON')
with zipfile.ZipFile(batch/'export-33.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr('connections/followers_and_following/following.json',json.dumps({'relationships_following':[{'title':n,'string_list_data':[{'href':'https://www.instagram.com/_u/'+n}]} for n in ['friend1','shared','not_mutual','another.one']]}))
with zipfile.ZipFile(batch/'export-34.zip','w') as z:
    z.writestr('media/photo.jpg',b'unrelated media')
with zipfile.ZipFile(base/'html.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr('followers_1.html','<html><body><a href="https://www.instagram.com/Friend/">Friend</a></body></html>')
    z.writestr('following.html','<html><body><a href="https://www.instagram.com/_u/Friend">Friend</a><a href="https://www.instagram.com/Not_Mutual/">Not_Mutual</a></body></html>')
with zipfile.ZipFile(base/'zip64.zip','w',compression=zipfile.ZIP_STORED) as z:
    for i in range(65536): z.writestr(f'media/{i}.txt','')
    with z.open('followers_1.json','w',force_zip64=True) as f: f.write(json.dumps([row('friend')]).encode())
    z.writestr('following.json',json.dumps({'relationships_following':[row('friend'),row('not_mutual')]}))
with zipfile.ZipFile(base/'empty.zip','w') as z:
    z.writestr('followers_1.json','[]')
    z.writestr('following.json','{"relationships_following":[]}')
data=bytearray((batch/'export-01.zip').read_bytes())
pos=data.index(b'PK\x01\x02')
data[pos+16]^=255
(base/'corrupt.zip').write_bytes(data)
data=bytearray((batch/'export-01.zip').read_bytes())
pos=data.rindex(b'PK\x05\x06')
struct.pack_into('<H',data,pos+4,1)
(base/'split.zip').write_bytes(data)
print('Created 34-part batch, HTML, ZIP64, empty, corrupt and split fixtures.')
