import shutil
from glob import glob

VAULT_PATH = '/Users/jcbowden/Documents/Obsidian Vault'
SITE_PATH = 'james-bowden.github.io'
DIR_PATH = f'{VAULT_PATH}/{SITE_PATH}/pages/vault'

def sync(original_path, pub_path):
	print(f'{original_path} --> {pub_path}')
	title = original_path.split('/')[-1]
	shutil.copy(original_path, f'{DIR_PATH}/{pub_path}/{title}')

def write_index(source):
	dest = '/'.join(source.split('/')[:-1]) + '/index.md'
	title = source.split('/')[-1].split('_')[-1].split('.')[0] # _index_title.md

	try:
		with open(source, 'r', encoding='utf-8') as source_file:
			content = source_file.readlines()

		# Create new content with title
		new_content = [] # [f"### {title}\n\n"]

		dirs, files = [], []
		for line in content:
			if '|index]]' in line: continue
			if '[[' in line:
				link = line.split('|')[0].replace('[[', '').replace(']]', '').replace(SITE_PATH, '').strip().strip('/')
				if '/_index_' in link:
					link = link.split('/')[-2]
				else: # relative path for files means only have to specify the file name
					link = link.split('/')[-1] 
				text = line.split('|')[1].replace('[[', '').replace(']]', '').replace('/n', '').strip()
				if '_index_' in text:
					text = text.replace('_index_', '')
					dirs.append(f'[**{text}**]({link})\n\n')
				else:
					files.append(f'[{text}]({link})\n\n')

		if len(dirs) > 0 and len(files) > 0:
			dirs.append('---\n\n')

		new_content += dirs + files # dirs go first

		# print(dest)

		# print(new_content)
		
		# Write to target file
		with open(dest, 'w', encoding='utf-8') as target_file:
		    target_file.writelines(new_content)
		
	except FileNotFoundError:
		print(f"Error: Could not find {source}")
	except Exception as e:
		print(f"An error occurred: {str(e)}")
	

def sync_index(verbose=False):
	fnames = glob(f'{DIR_PATH}/**/_index_*', recursive=True)
	if verbose: print(fnames)
	for f in fnames:
		write_index(f)

def sync_atomic(verbose=False):
	fnames = glob(f'{VAULT_PATH}/**/_a_*', recursive=True)
	if verbose: print(fnames)
	for f in fnames:
		if DIR_PATH in f: continue
		# in atomic folder, don't need _a_ tag too
		shutil.copy(f, f"{DIR_PATH}/atomic/{f.split('/')[-1].replace('_a_', '')}")
		# sync(f, 'atomic')

if __name__ == "__main__":
	sync_atomic()
	sync_index()

	# maybe make a separate csv that gets edited?
	sync(f'{VAULT_PATH}/__ref/yogas.md', 'lists')
	sync(f'{VAULT_PATH}/__ref/Engagement Queue.md', 'for_self')
	sync(f'{VAULT_PATH}/__ref/Engagement List — Hum.md', 'for_self')
