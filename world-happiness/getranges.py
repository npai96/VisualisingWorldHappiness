import pandas as pd
from collections import defaultdict

years = [2015, 2016, 2017, 2018, 2019]
metrics = ["Happiness Score", "Happiness Rank", "Economy (GDP per Capita)", "Family", "Health (Life Expectancy)", "Freedom", "Trust (Government Corruption)", "Generosity", "Dystopia Residual"]
metric_to_range = defaultdict(list)



for year in years:
	year = str(year)
	# print(year + ":\n")
	filename = year + ".csv"
	df=pd.read_csv(filename)
	for metric in metrics:
		if metric in df.columns:
			mini = df[metric].min()
			maxi = df[metric].max()
			# print(metric + ":\n")
			if metric_to_range[metric]:
				metric_to_range[metric][0] = min(metric_to_range[metric][0], mini)
				metric_to_range[metric][1] = max(metric_to_range[metric][1], maxi)
			else:
				metric_to_range[metric] = [mini, maxi]

print(metric_to_range)


	