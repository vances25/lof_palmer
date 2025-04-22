from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import time

load_dotenv()


database = None
app = FastAPI()


words = {
		"tapped": 0,
 		"hit": 0, 
 		"collided": 0,
 		"smashed": 0,
 		"crashed": 0
 	}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def get_averages(doc):
	total = 0
	count = 0

	for submission in doc:
		total += submission["speed"]
		count += 1

	if total == 0 and count == 0:
		return 0
	return total / count
	

@app.get("/get_data")
async def get_data(password: str = None):
	global database
	if password == "password123":

		word_tapped, word_hit, word_collided, word_smashed, word_crash = await asyncio.gather(
			database.results.results.find({"word": "tapped"}, {"_id": 0}).to_list(None),
			database.results.results.find({"word": "hit"}, {"_id": 0}).to_list(None),
			database.results.results.find({"word": "collided"}, {"_id": 0}).to_list(None),
			database.results.results.find({"word": "smashed"}, {"_id": 0}).to_list(None),
			database.results.results.find({"word": "crashed"}, {"_id": 0}).to_list(None)
		)




		print(get_averages(word_tapped), get_averages(word_hit), get_averages(word_collided), get_averages(word_smashed), get_averages(word_crash))

		return {
		"tapped": {"guesses": word_tapped, "average": get_averages(word_tapped)},
		"hit": {"guesses": word_hit, "average": get_averages(word_hit)},
		"collided": {"guesses": word_collided, "average": get_averages(word_collided)},
		"smashed": {"guesses": word_smashed, "average": get_averages(word_smashed)},
		"crashed": {"guesses": word_crash, "average": get_averages(word_crash)}
		
		}
	raise HTTPException(status_code=401, detail="you are not permited")



@app.get("/getword")
async def getword():
	global words
	lowest_four = sorted(words.items(), key=lambda x: x[1])[:4]

	return {"word": random.choice(lowest_four)[0]}

class Submit(BaseModel):
	word: str
	speed: int
@app.post("/submit")
async def submit(data: Submit):
	global database
	global words

	try:
		words[str(data.word)] += 1

		await database.results.results.insert_one({"word": data.word,"speed": data.speed, "time": time.time()})
		return {"message": "we have received your response!"}
	except Exception as e:
		print(e)
		raise HTTPException(status_code=401, detail="you are not permited here")



async def main():
	global database
	global words

	database = AsyncIOMotorClient(os.getenv("mongodb"))

	current_data = database.results.results.find({}, {"_id": 0})


	async for ii in current_data:
		entry_word = ii["word"]
		if entry_word in words:
			words[entry_word] += 1

	config = uvicorn.Config(app, host="0.0.0.0", port=5000)
	server = uvicorn.Server(config)

	await server.serve()


if __name__ == "__main__":
	asyncio.run(main())